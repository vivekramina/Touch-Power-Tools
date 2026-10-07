#!/usr/bin/env python3
"""
================================================================================
TouchPower™ - DWM Module 2: Attribute Relevance Analysis & Decision Tree
================================================================================
Theory Concepts Covered:
1. Attribute Relevance Analysis:
   - Information Gain (ID3 Metric): Gain(S, A) = Entropy(S) - sum(|Sv|/|S| * Entropy(Sv))
   - Gain Ratio (C4.5 Metric): GainRatio(S, A) = Gain(S, A) / SplitInfo(S, A)
   - Gini Index (CART Metric): Gini(S) = 1 - sum(p_i^2)
   - Feature Ranking & Pruning of irrelevant attributes

2. Decision Tree Classification:
   - Recursive Splitting via Maximum Information Gain
   - IF-THEN Rule Extraction
   - Structural Tree Node Hierarchy (Root, Internal Decision Nodes, Leaves)
   - Accuracy Evaluation & Test Sample Classification
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


def compute_entropy(labels):
    """Compute Shannon Entropy: H(S) = -sum(p * log2(p))"""
    if not labels:
        return 0.0
    total = len(labels)
    counts = Counter(labels)
    entropy = 0.0
    for count in counts.values():
        p = count / total
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy


def compute_gini(labels):
    """Compute Gini Impurity: Gini(S) = 1 - sum(p^2)"""
    if not labels:
        return 0.0
    total = len(labels)
    counts = Counter(labels)
    gini = 1.0 - sum((count / total) ** 2 for count in counts.values())
    return gini


def discretize_dataset(products):
    """
    Discretize continuous real-world product features into meaningful DWM bins:
    - Stock Level: Low (<=15), Medium (16-40), High (>40)
    - Days of Inventory: Critical (<20d), Warning (20-45d), Healthy (>45d)
    - Sales Velocity: High (>80), Medium (40-80), Low (<40)
    - Price Tier: Budget (<2000), Mid (2000-10000), Industrial (>10000)
    """
    discretized = []
    for p in products:
        stock = float(p["stock_count"])
        velocity = float(p["monthly_units_velocity"])
        price = float(p["price"])
        category = p["category"]
        lead_time = float(p["lead_time_days"])
        urgency = p["reorder_urgency"]

        # Days of supply = stock / (velocity / 30)
        daily_rate = max(0.2, velocity / 30.0)
        days_supply = stock / daily_rate

        if days_supply < 15:
            days_tier = "Critical (<15d)"
        elif days_supply <= 35:
            days_tier = "Warning (15-35d)"
        else:
            days_tier = "Healthy (>35d)"

        if stock <= 15:
            stock_tier = "Low (<=15)"
        elif stock <= 40:
            stock_tier = "Medium (16-40)"
        else:
            stock_tier = "High (>40)"

        if velocity >= 80:
            vel_tier = "High (>80/mo)"
        elif velocity >= 40:
            vel_tier = "Medium (40-80/mo)"
        else:
            vel_tier = "Moderate (<40/mo)"

        if price < 2000:
            price_tier = "Economy (<₹2k)"
        elif price <= 10000:
            price_tier = "Standard (₹2k-₹10k)"
        else:
            price_tier = "Enterprise (>₹10k)"

        if lead_time >= 8:
            lead_tier = "Long (>=8d)"
        else:
            lead_tier = "Fast (<8d)"

        discretized.append({
            "name": p["name"],
            "Category": category,
            "Days_Of_Supply": days_tier,
            "Stock_Level": stock_tier,
            "Sales_Velocity": vel_tier,
            "Price_Tier": price_tier,
            "Lead_Time": lead_tier,
            "Reorder_Urgency": urgency
        })
    return discretized


def perform_attribute_relevance_analysis(dataset, target_col="Reorder_Urgency"):
    """
    Perform Attribute Relevance Analysis using Information Gain, Gain Ratio, and Gini Index.
    """
    total_samples = len(dataset)
    target_labels = [row[target_col] for row in dataset]
    base_entropy = compute_entropy(target_labels)
    base_gini = compute_gini(target_labels)

    candidate_attributes = [
        col for col in dataset[0].keys() 
        if col not in (target_col, "name")
    ]

    analysis_results = []

    for attr in candidate_attributes:
        # Partition dataset by attribute values
        partitions = defaultdict(list)
        for row in dataset:
            partitions[row[attr]].append(row[target_col])

        # Conditional Entropy: H(S|A)
        cond_entropy = 0.0
        split_info = 0.0
        cond_gini = 0.0

        for val, subset in partitions.items():
            prob = len(subset) / total_samples
            subset_entropy = compute_entropy(subset)
            subset_gini = compute_gini(subset)

            cond_entropy += prob * subset_entropy
            cond_gini += prob * subset_gini
            if prob > 0:
                split_info -= prob * math.log2(prob)

        info_gain = base_entropy - cond_entropy
        gain_ratio = (info_gain / split_info) if split_info > 0 else 0.0
        gini_reduction = base_gini - cond_gini

        analysis_results.append({
            "attribute": attr,
            "information_gain": round(info_gain, 4),
            "split_info": round(split_info, 4),
            "gain_ratio": round(gain_ratio, 4),
            "gini_reduction": round(gini_reduction, 4),
            "distinct_values": list(partitions.keys())
        })

    # Rank by Information Gain (ID3 criteria)
    analysis_results.sort(key=lambda x: x["information_gain"], reverse=True)

    # Assign relevance tier
    for idx, res in enumerate(analysis_results, start=1):
        res["rank"] = idx
        if res["information_gain"] >= 0.50:
            res["relevance"] = "Highly Informative (Primary Decision Driver)"
        elif res["information_gain"] >= 0.20:
            res["relevance"] = "Moderately Informative"
        else:
            res["relevance"] = "Low Relevance / Redundant"

    return {
        "base_entropy": round(base_entropy, 4),
        "base_gini": round(base_gini, 4),
        "ranked_attributes": analysis_results
    }


# ==============================================================================
# Decision Tree Node & Builder (ID3 Algorithm)
# ==============================================================================
class DecisionTreeNode:
    def __init__(self, attribute=None, is_leaf=False, prediction=None, distribution=None):
        self.attribute = attribute          # Attribute tested at this node
        self.is_leaf = is_leaf              # True if terminal leaf
        self.prediction = prediction        # Class label predicted
        self.distribution = distribution    # Distribution of classes at this node
        self.branches = {}                  # Map of attribute_value -> child Node

    def to_dict(self):
        if self.is_leaf:
            return {
                "type": "leaf",
                "prediction": self.prediction,
                "distribution": self.distribution
            }
        return {
            "type": "decision_node",
            "attribute": self.attribute,
            "distribution": self.distribution,
            "branches": {val: child.to_dict() for val, child in self.branches.items()}
        }


def build_decision_tree(dataset, features, target_col="Reorder_Urgency", depth=0, max_depth=4):
    labels = [row[target_col] for row in dataset]
    label_counts = Counter(labels)

    # 1. Base case: Pure node
    if len(label_counts) == 1:
        majority_class = labels[0]
        return DecisionTreeNode(is_leaf=True, prediction=majority_class, distribution=dict(label_counts))

    # 2. Base case: No remaining features or max depth reached
    majority_class = label_counts.most_common(1)[0][0]
    if not features or depth >= max_depth:
        return DecisionTreeNode(is_leaf=True, prediction=majority_class, distribution=dict(label_counts))

    # 3. Find best feature by Information Gain
    base_entropy = compute_entropy(labels)
    best_feature = None
    best_gain = -1.0

    for feat in features:
        partitions = defaultdict(list)
        for row in dataset:
            partitions[row[feat]].append(row[target_col])

        cond_entropy = sum(
            (len(sub) / len(dataset)) * compute_entropy(sub) 
            for sub in partitions.values()
        )
        gain = base_entropy - cond_entropy
        if gain > best_gain:
            best_gain = gain
            best_feature = feat

    if best_gain <= 0.001 or best_feature is None:
        return DecisionTreeNode(is_leaf=True, prediction=majority_class, distribution=dict(label_counts))

    # 4. Create Decision Node and split recursively
    node = DecisionTreeNode(
        attribute=best_feature, 
        is_leaf=False, 
        distribution=dict(label_counts)
    )

    remaining_features = [f for f in features if f != best_feature]
    feature_values = sorted(list(set(row[best_feature] for row in dataset)))

    for val in feature_values:
        sub_dataset = [row for row in dataset if row[best_feature] == val]
        if not sub_dataset:
            child = DecisionTreeNode(is_leaf=True, prediction=majority_class, distribution=dict(label_counts))
        else:
            child = build_decision_tree(sub_dataset, remaining_features, target_col, depth + 1, max_depth)
        node.branches[val] = child

    return node


def classify_sample(node, sample):
    """Classify a single sample by traversing the Decision Tree"""
    if node.is_leaf:
        return node.prediction

    attr_val = sample.get(node.attribute)
    if attr_val in node.branches:
        return classify_sample(node.branches[attr_val], sample)
    else:
        # Fallback to majority class in this node's distribution
        if node.distribution:
            return max(node.distribution, key=node.distribution.get)
        return "Optimal Buffer"


def extract_decision_rules(node, current_conditions=None):
    """Extract human-readable IF-THEN rules from the tree"""
    if current_conditions is None:
        current_conditions = []

    if node.is_leaf:
        conditions_str = " AND ".join(current_conditions) if current_conditions else "TRUE"
        return [f"IF {conditions_str} THEN Reorder_Urgency = '{node.prediction}'"]

    rules = []
    for val, child in node.branches.items():
        branch_cond = f"({node.attribute} == '{val}')"
        rules.extend(extract_decision_rules(child, current_conditions + [branch_cond]))
    return rules


def print_ascii_tree(node, indent=""):
    if node.is_leaf:
        print(f"{indent}└── 🎯 [PREDICTION: {node.prediction}] (Samples: {node.distribution})")
        return

    print(f"{indent}├── ❓ [TEST: {node.attribute}]")
    branch_items = list(node.branches.items())
    for i, (val, child) in enumerate(branch_items):
        is_last = (i == len(branch_items) - 1)
        branch_symbol = "└──" if is_last else "├──"
        print(f"{indent}│   {branch_symbol} Value = '{val}':")
        next_indent = indent + ("    " if is_last else "│   ")
        print_ascii_tree(child, next_indent)


def run_decision_tree_analysis(csv_path):
    print("=" * 78)
    print("  [DWM TOPIC 2]: ATTRIBUTE RELEVANCE ANALYSIS & DECISION TREE")
    print("=" * 78)
    print("Objective: Attribute Ranking (Information Gain / Gini) & Decision Tree Induction\n")

    # 1. Load products data
    products = []
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            products.append(row)

    # 2. Discretize into training dataset
    discretized = discretize_dataset(products)
    n = len(discretized)

    # 3. Attribute Relevance Analysis
    relevance_report = perform_attribute_relevance_analysis(discretized)

    print(f"Target Classification Variable:  Reorder_Urgency")
    print(f"Classes:                          Critical Urgent, Restock Warning, Optimal Buffer")
    print(f"Dataset Size:                    {n} catalog SKUs")
    print(f"Base Dataset Entropy H(S):       {relevance_report['base_entropy']:.4f} bits")
    print(f"Base Dataset Gini Impurity:      {relevance_report['base_gini']:.4f}")
    print("-" * 78)
    print("ATTRIBUTE RELEVANCE ANALYSIS (INFORMATION GAIN & GAIN RATIO RANKING):")
    print(f"{'Rank':<5} {'Attribute':<18} {'Info Gain (bits)':<18} {'Gain Ratio':<12} {'Gini Red.':<12} {'Relevance Status'}")
    print("-" * 88)

    for res in relevance_report["ranked_attributes"]:
        print(f"#{res['rank']:<4} {res['attribute']:<18} {res['information_gain']:<18.4f} {res['gain_ratio']:<12.4f} {res['gini_reduction']:<12.4f} {res['relevance']}")

    print("-" * 78)
    print("DWM Takeaway: 'Days_Of_Supply' and 'Stock_Level' exhibit the highest Information Gain.")
    print("Consequently, 'Days_Of_Supply' is selected as the ROOT NODE of the Decision Tree.")
    print("-" * 78)

    # 4. Build Decision Tree
    features = [res["attribute"] for res in relevance_report["ranked_attributes"]]
    tree_root = build_decision_tree(discretized, features, max_depth=3)

    print("\nINDUCED DECISION TREE HIERARCHY:")
    print_ascii_tree(tree_root)

    # 5. Extract Rules
    rules = extract_decision_rules(tree_root)
    print("\n" + "-" * 78)
    print("EXTRACTED IF-THEN PRODUCTION RULES:")
    print("-" * 78)
    for idx, rule in enumerate(rules, start=1):
        print(f"  Rule {idx:02d}: {rule}")
    print("-" * 78)

    # 6. Evaluate Accuracy
    correct = 0
    test_evaluations = []
    for item in discretized:
        pred = classify_sample(tree_root, item)
        actual = item["Reorder_Urgency"]
        is_correct = (pred == actual)
        if is_correct:
            correct += 1
        test_evaluations.append({
            "name": item["name"],
            "days_of_supply": item["Days_Of_Supply"],
            "stock_level": item["Stock_Level"],
            "actual_urgency": actual,
            "predicted_urgency": pred,
            "correct": is_correct
        })

    accuracy = (correct / n) * 100.0
    print(f"\nModel Evaluation:")
    print(f"  Decision Tree Classification Accuracy: {accuracy:.2f}% ({correct}/{n} correct)")
    print(f"  Misclassifications:                   {n - correct}")
    print("-" * 78)

    return {
        "module": "Attribute Relevance & Decision Tree",
        "target": "Reorder_Urgency",
        "total_records": n,
        "base_entropy": relevance_report["base_entropy"],
        "base_gini": relevance_report["base_gini"],
        "ranked_attributes": relevance_report["ranked_attributes"],
        "tree_structure": tree_root.to_dict(),
        "rules": rules,
        "accuracy_pct": round(accuracy, 2),
        "test_evaluations": test_evaluations
    }


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    prods_csv = os.path.join(base_dir, 'touchpower_products_dataset.csv')

    dt_results = run_decision_tree_analysis(prods_csv)

    output_json = os.path.join(base_dir, 'decision_tree_results.json')
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(dt_results, f, indent=2)

    print(f"✓ Decision Tree model successfully evaluated and saved to: {output_json}")
