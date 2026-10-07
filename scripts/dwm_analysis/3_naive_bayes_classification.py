#!/usr/bin/env python3
"""
================================================================================
TouchPower™ - DWM Module 3: Naïve Bayes Classification & Model Evaluation
================================================================================
Theory Concepts Covered:
1. Bayes' Theorem:
   P(C_k | X) = [ P(C_k) * prod(P(x_i | C_k)) ] / P(X)
   Log Posterior Formulation:
   ln P(C_k | X) = ln P(C_k) + sum( ln P(x_i | C_k) )

2. Laplace Add-1 Smoothing (Categorical Features):
   P(x_i = v | C_k) = (Count(x_i = v, C_k) + 1) / (Total(C_k) + |V_i|)

3. Continuous Feature Modeling (Gaussian Likelihood):
   P(x | mu, sigma^2) = (1 / sqrt(2*pi*sigma^2)) * exp( - (x - mu)^2 / (2*sigma^2) )

4. Comprehensive Evaluation Metrics:
   - 2x2 Confusion Matrix: True Positive (TP), False Positive (FP), False Negative (FN), True Negative (TN)
   - Accuracy:    (TP + TN) / (TP + TN + FP + FN)
   - Precision:   TP / (TP + FP)
   - Recall:      TP / (TP + FN)  [Sensitivity / Hit Rate]
   - F1-Score:    2 * (Precision * Recall) / (Precision + Recall)
   - Specificity: TN / (TN + FP)
================================================================================
"""

import os
import sys
import csv
import json
import math
from collections import Counter, defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class NaiveBayesClassifier:
    def __init__(self, use_gaussian_for_weight=True):
        self.classes = ['On-Time', 'Delayed']
        self.priors = {}
        self.conditional_categorical = {}
        self.vocabulary_sizes = {}
        self.gaussian_stats = {}
        self.use_gaussian = use_gaussian_for_weight
        self.total_train_samples = 0
        self.categorical_features = ['carrier', 'zone', 'value_tier', 'payment_method', 'priority']

    def train(self, training_data):
        self.total_train_samples = len(training_data)
        class_counts = Counter(row['actual_outcome'] for row in training_data)

        # 1. Priors: P(C_k)
        for cls in self.classes:
            self.priors[cls] = class_counts[cls] / self.total_train_samples

        # 2. Vocabulary sizes and counts for categorical features
        for cls in self.classes:
            self.conditional_categorical[cls] = {}
            for feat in self.categorical_features:
                self.conditional_categorical[cls][feat] = defaultdict(int)

        self.vocabulary_sizes = {feat: set() for feat in self.categorical_features}

        for row in training_data:
            cls = row['actual_outcome']
            for feat in self.categorical_features:
                val = row[feat]
                self.vocabulary_sizes[feat].add(val)
                self.conditional_categorical[cls][feat][val] += 1

        # 3. Gaussian statistics for continuous feature: weight_kg
        for cls in self.classes:
            weights = [float(row['weight_kg']) for row in training_data if row['actual_outcome'] == cls]
            if weights:
                mean = sum(weights) / len(weights)
                variance = max(0.5, sum((w - mean) ** 2 for w in weights) / len(weights))
            else:
                mean, variance = 10.0, 25.0
            self.gaussian_stats[cls] = {'mean': mean, 'variance': variance}

        return self

    def _gaussian_log_likelihood(self, x, mean, var):
        """Compute ln( 1/sqrt(2*pi*var) * exp(-(x-mean)^2 / (2*var)) )"""
        return -0.5 * math.log(2 * math.pi * var) - ((x - mean) ** 2) / (2 * var)

    def predict_log_proba(self, sample):
        log_posteriors = {}

        for cls in self.classes:
            log_p = math.log(self.priors[cls])

            # Categorical likelihoods with Laplace Smoothing
            for feat in self.categorical_features:
                val = sample.get(feat, '')
                count = self.conditional_categorical[cls][feat].get(val, 0)
                vocab_size = len(self.vocabulary_sizes[feat])
                class_total = sum(self.conditional_categorical[cls][feat].values())

                prob = (count + 1.0) / (class_total + vocab_size)
                log_p += math.log(prob)

            # Gaussian likelihood for weight
            if self.use_gaussian and 'weight_kg' in sample:
                w = float(sample['weight_kg'])
                stat = self.gaussian_stats[cls]
                log_p += self._gaussian_log_likelihood(w, stat['mean'], stat['variance'])

            log_posteriors[cls] = log_p

        # Softmax normalization
        max_log = max(log_posteriors.values())
        exp_vals = {cls: math.exp(lp - max_log) for cls, lp in log_posteriors.items()}
        total_exp = sum(exp_vals.values())
        probabilities = {cls: exp_vals[cls] / total_exp for cls in self.classes}

        predicted_class = max(probabilities, key=probabilities.get)
        confidence = probabilities[predicted_class]

        return predicted_class, confidence, probabilities

    def evaluate(self, test_data):
        tp, fp, fn, tn = 0, 0, 0, 0
        detailed_rows = []

        for row in test_data:
            actual = row['actual_outcome']
            pred, conf, probs = self.predict_log_proba(row)

            # Confusion Matrix Definition:
            # Positive class = 'On-Time' (Delivered)
            # Negative class = 'Delayed' (Returned / High Risk Alert)
            if actual == 'On-Time' and pred == 'On-Time':
                tp += 1
            elif actual == 'Delayed' and pred == 'On-Time':
                fp += 1
            elif actual == 'On-Time' and pred == 'Delayed':
                fn += 1
            elif actual == 'Delayed' and pred == 'Delayed':
                tn += 1

            detailed_rows.append({
                "order_id": row["order_id"],
                "carrier": row["carrier"],
                "zone": row["zone"],
                "weight_kg": row["weight_kg"],
                "actual": actual,
                "predicted": pred,
                "confidence": round(conf * 100, 1),
                "is_correct": (actual == pred)
            })

        total = tp + fp + fn + tn
        accuracy = (tp + tn) / total if total > 0 else 0.0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1_score = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

        # Delayed (negative class) performance
        delayed_precision = tn / (tn + fn) if (tn + fn) > 0 else 0.0
        delayed_recall = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        delayed_f1 = (2 * delayed_precision * delayed_recall) / (delayed_precision + delayed_recall) if (delayed_precision + delayed_recall) > 0 else 0.0

        return {
            "confusion_matrix": {
                "tp": tp, "fp": fp, "fn": fn, "tn": tn, "total": total
            },
            "metrics": {
                "accuracy": round(accuracy * 100, 1),
                "precision": round(precision * 100, 1),
                "recall": round(recall * 100, 1),
                "f1_score": round(f1_score * 100, 1),
                "specificity": round(specificity * 100, 1)
            },
            "delayed_metrics": {
                "precision": round(delayed_precision * 100, 1),
                "recall": round(delayed_recall * 100, 1),
                "f1_score": round(delayed_f1 * 100, 1)
            },
            "sample_predictions": detailed_rows
        }


def run_naive_bayes_analysis(orders_csv_path):
    print("=" * 78)
    print("  [DWM TOPIC 3]: NAÏVE BAYES CLASSIFICATION & MODEL EVALUATION")
    print("=" * 78)
    print("Objective: Predict Consignment Status (Delivered vs Return/Delayed)")
    print("Evaluation: Accuracy, Confusion Matrix, Precision, Recall, and F1-Score\n")

    orders = []
    with open(orders_csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            orders.append(row)

    # Train / Test Split:
    # First 60 samples for training, remaining 20 samples for hold-out test evaluation
    train_set = orders[:60]
    test_set = orders[60:]

    print(f"Total Order Records:         {len(orders)}")
    print(f"Training Dataset:            {len(train_set)} consignment dispatches")
    print(f"Hold-out Test Dataset:       {len(test_set)} consignment dispatches")
    print("-" * 78)

    # Train model
    nb = NaiveBayesClassifier(use_gaussian_for_weight=True)
    nb.train(train_set)

    print("Learned Prior Probabilities P(Class):")
    print(f"  P(Delivered / On-Time):    {nb.priors['On-Time']:.4f} ({nb.priors['On-Time']*100:.1f}%)")
    print(f"  P(Returned / Delayed):     {nb.priors['Delayed']:.4f} ({nb.priors['Delayed']*100:.1f}%)")
    print("-" * 78)

    # Evaluate model
    eval_result = nb.evaluate(test_set)
    cm = eval_result["confusion_matrix"]
    m = eval_result["metrics"]

    print("2x2 CONFUSION MATRIX (TEST SAMPLES = 20):")
    print("┌───────────────────────────┬─────────────────────┬─────────────────────┐")
    print("│ ACTUAL \\ PREDICTED        │ Predicted DELIVERED │ Predicted RETURNED  │")
    print("├───────────────────────────┼─────────────────────┼─────────────────────┤")
    print(f"│ Actual DELIVERED (On-Time)│ TP = {cm['tp']:<14} │ FN = {cm['fn']:<14} │")
    print(f"│ Actual RETURNED (Delayed) │ FP = {cm['fp']:<14} │ TN = {cm['tn']:<14} │")
    print("└───────────────────────────┴─────────────────────┴─────────────────────┘")
    print(f"Total Correct: {cm['tp'] + cm['tn']} / {cm['total']}  |  Total Misclassified: {cm['fp'] + cm['fn']} / {cm['total']}\n")

    print("-" * 78)
    print("DWM MODEL EVALUATION METRICS REPORT:")
    print("-" * 78)
    print(f"  1. Accuracy:   {m['accuracy']}%   [Formula: (TP + TN) / Total  = ({cm['tp']}+{cm['tn']})/{cm['total']}]")
    print(f"  2. Precision:  {m['precision']}%   [Formula: TP / (TP + FP)     = {cm['tp']}/({cm['tp']}+{cm['fp']})]")
    print(f"  3. Recall:     {m['recall']}%  [Formula: TP / (TP + FN)     = {cm['tp']}/({cm['tp']}+{cm['fn']})]")
    print(f"  4. F1-Score:   {m['f1_score']}%   [Formula: 2*(P*R) / (P+R)    = 2*({m['precision']}*{m['recall']})/({m['precision']}+{m['recall']})]")
    print(f"  5. Specificity:{m['specificity']}%   [Formula: TN / (TN + FP)     = {cm['tn']}/({cm['tn']}+{cm['fp']})]")
    print("-" * 78)

    print("PER-CLASS CLASSIFICATION BREAKDOWN:")
    print(f"{'Class':<22} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support'}")
    print("-" * 66)
    print(f"{'On-Time (Delivered)':<22} {m['precision']:<12.1f} {m['recall']:<12.1f} {m['f1_score']:<12.1f} {cm['tp'] + cm['fn']}")
    dm = eval_result["delayed_metrics"]
    print(f"{'Delayed (Returned)':<22} {dm['precision']:<12.1f} {dm['recall']:<12.1f} {dm['f1_score']:<12.1f} {cm['tn'] + cm['fp']}")
    print("-" * 66)

    # Test Sample Predictions
    print("\nSAMPLE PREDICTIONS ON HELD-OUT TEST CONSIGNMENTS:")
    print(f"{'Order ID':<10} {'Carrier':<26} {'Zone':<20} {'Actual':<10} {'Predicted':<10} {'Conf %':<8} {'Status'}")
    print("-" * 92)
    for sample in eval_result["sample_predictions"][:8]:
        verdict = "✓ CORRECT" if sample["is_correct"] else "✗ WRONG"
        print(f"{sample['order_id']:<10} {sample['carrier'][:24]:<26} {sample['zone'][:18]:<20} {sample['actual']:<10} {sample['predicted']:<10} {sample['confidence']:<8.1f} {verdict}")

    return {
        "module": "Naïve Bayes Classification",
        "dataset_summary": {
            "total_samples": len(orders),
            "train_samples": len(train_set),
            "test_samples": len(test_set)
        },
        "priors": {k: round(v, 4) for k, v in nb.priors.items()},
        "confusion_matrix": cm,
        "metrics": m,
        "delayed_metrics": dm,
        "sample_predictions": eval_result["sample_predictions"]
    }


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    orders_csv = os.path.join(base_dir, 'touchpower_orders_dataset.csv')

    nb_report = run_naive_bayes_analysis(orders_csv)

    output_json = os.path.join(base_dir, 'naive_bayes_results.json')
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(nb_report, f, indent=2)

    print(f"\n✓ Naïve Bayes model successfully evaluated and saved to: {output_json}")
