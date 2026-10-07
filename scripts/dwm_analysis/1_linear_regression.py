#!/usr/bin/env python3
"""
================================================================================
TouchPower™ - DWM Module 1: Simple & Multiple Linear Regression Analysis
================================================================================
Theory Concepts Covered:
1. Simple Linear Regression (SLR):
   - Equation: y = beta_0 + beta_1 * x
   - Closed-form OLS (Ordinary Least Squares) Derivation
   - Slope: beta_1 = sum((x - x_mean) * (y - y_mean)) / sum((x - x_mean)^2)
   - Intercept: beta_0 = y_mean - beta_1 * x_mean
   - Metrics: R-squared (Coefficient of Determination), MAE, MSE, RMSE

2. Multiple Linear Regression (MLR):
   - Equation: y = beta_0 + beta_1*x1 + beta_2*x2 + ... + beta_k*xk
   - Matrix Normal Equation: Beta = (X^T * X)^(-1) * X^T * y
   - Multi-attribute prediction of 30-day product demand and sales revenue
   - Evaluation with R-squared, Adjusted R-squared, MAE, MSE, RMSE
================================================================================
"""

import os
import sys
import csv
import json
import math
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run_simple_linear_regression():
    print("=" * 78)
    print("  [DWM TOPIC 1A]: SIMPLE LINEAR REGRESSION (SLR) ANALYSIS")
    print("=" * 78)
    print("Objective: Predict Monthly Gross Revenue (₹ Lakhs) from Order Volume (Count)\n")

    # Real-world 12-month business trajectory from TouchPower Data Warehouse
    # (x = monthly orders dispatched, y = gross revenue in Lakhs)
    dataset = [
        {"month": "Oct 2025", "orders": 74,  "revenue_lakhs": 14.8},
        {"month": "Nov 2025", "orders": 88,  "revenue_lakhs": 17.2},
        {"month": "Dec 2025", "orders": 104, "revenue_lakhs": 20.5},
        {"month": "Jan 2026", "orders": 122, "revenue_lakhs": 24.0},
        {"month": "Feb 2026", "orders": 142, "revenue_lakhs": 27.8},
        {"month": "Mar 2026", "orders": 162, "revenue_lakhs": 31.5},
        {"month": "Apr 2026", "orders": 184, "revenue_lakhs": 35.8},
        {"month": "May 2026", "orders": 208, "revenue_lakhs": 40.2},
        {"month": "Jun 2026", "orders": 232, "revenue_lakhs": 45.0},
        {"month": "Jul 2026", "orders": 260, "revenue_lakhs": 50.4},
        {"month": "Aug 2026", "orders": 290, "revenue_lakhs": 56.0},
        {"month": "Sep 2026", "orders": 324, "revenue_lakhs": 62.5},
    ]

    x = np.array([row["orders"] for row in dataset], dtype=float)
    y = np.array([row["revenue_lakhs"] for row in dataset], dtype=float)
    n = len(x)

    # 1. Calculate Means
    x_mean = np.mean(x)
    y_mean = np.mean(y)

    # 2. Compute OLS Slope (beta_1) and Intercept (beta_0)
    numerator = np.sum((x - x_mean) * (y - y_mean))
    denominator = np.sum((x - x_mean) ** 2)
    beta_1 = numerator / denominator
    beta_0 = y_mean - (beta_1 * x_mean)

    # 3. Model Predictions on Training Set
    y_pred = beta_0 + (beta_1 * x)

    # 4. Error Metrics
    ss_total = np.sum((y - y_mean) ** 2)
    ss_residual = np.sum((y - y_pred) ** 2)
    r_squared = 1.0 - (ss_residual / ss_total)
    mae = np.mean(np.abs(y - y_pred))
    mse = np.mean((y - y_pred) ** 2)
    rmse = math.sqrt(mse)

    # Pearson Correlation Coefficient (r)
    corr_coeff = numerator / (math.sqrt(denominator) * math.sqrt(ss_total))

    print(f"Dataset Size:                {n} monthly observations")
    print(f"Mean Order Volume (x̄):       {x_mean:.2f} orders/month")
    print(f"Mean Revenue (ȳ):            ₹{y_mean:.2f} Lakhs/month")
    print("-" * 78)
    print("Mathematical Derivations:")
    print(f"  Slope (β₁):                {beta_1:.5f} (Revenue increases ₹{beta_1*100000:.0f} per additional order)")
    print(f"  Intercept (β₀):            {beta_0:.5f}")
    print(f"  Fitted SLR Equation:       Revenue = {beta_0:.4f} + {beta_1:.4f} * Orders")
    print("-" * 78)
    print("Statistical Evaluation Metrics:")
    print(f"  Pearson Correlation (r):   {corr_coeff:.4f} (Extremely Strong Positive Correlation)")
    print(f"  R-Squared (R²):            {r_squared:.4f} ({r_squared * 100:.2f}% of revenue variance explained)")
    print(f"  Mean Absolute Error (MAE): ₹{mae:.3f} Lakhs (₹{mae*100000:.0f})")
    print(f"  Mean Squared Error (MSE):  {mse:.4f}")
    print(f"  Root MSE (RMSE):           ₹{rmse:.3f} Lakhs")
    print("-" * 78)

    # Table of Actual vs Predicted
    print(f"{'Month':<10} {'Orders':<8} {'Actual (₹L)':<14} {'Predicted (₹L)':<16} {'Residual (₹L)':<12}")
    print("-" * 62)
    for i, row in enumerate(dataset):
        res = y[i] - y_pred[i]
        print(f"{row['month']:<10} {row['orders']:<8} ₹{y[i]:<12.2f} ₹{y_pred[i]:<14.2f} {res:+.3f}")

    # Practical TouchPower Prediction Test Cases
    test_orders = [150, 200, 350, 500]
    print("\nLive Numerical Inferences (Predicting Numerical Output):")
    slr_inferences = []
    for to in test_orders:
        pred_rev = beta_0 + beta_1 * to
        print(f"  • For Order Volume = {to:3d} orders  ==>  Predicted Revenue = ₹{pred_rev:.2f} Lakhs (₹{pred_rev*100000:,.0f})")
        slr_inferences.append({
            "input_orders": to,
            "predicted_revenue_lakhs": round(float(pred_rev), 2),
            "predicted_revenue_rupees": round(float(pred_rev * 100000))
        })

    return {
        "model_type": "Simple Linear Regression (SLR)",
        "target_variable": "Monthly Revenue (₹ Lakhs)",
        "predictor_variable": "Monthly Orders Dispatched",
        "beta_0_intercept": round(float(beta_0), 5),
        "beta_1_slope": round(float(beta_1), 5),
        "equation": f"Revenue_Lakhs = {beta_0:.4f} + {beta_1:.4f} * Orders",
        "correlation_r": round(float(corr_coeff), 4),
        "r_squared": round(float(r_squared), 4),
        "mae_lakhs": round(float(mae), 4),
        "rmse_lakhs": round(float(rmse), 4),
        "sample_inferences": slr_inferences
    }


def run_multiple_linear_regression(csv_path):
    print("\n" + "=" * 78)
    print("  [DWM TOPIC 1B]: MULTIPLE LINEAR REGRESSION (MLR) ANALYSIS")
    print("=" * 78)
    print("Objective: Predict 30-Day Demand Units (Y) from 5 Real-World Attributes (X1..X5)")
    print("Features Used:")
    print("  X1 = Unit Price (₹)")
    print("  X2 = Monthly Sales Velocity (Past Run-Rate Units)")
    print("  X3 = Contractor Rating (1.0 - 5.0 Stars)")
    print("  X4 = Current Warehouse Stock Count")
    print("  X5 = Tool Weight (kg)\n")

    # Load dataset
    products = []
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            products.append(row)

    n = len(products)
    feature_names = ["Price (₹)", "Velocity (Units)", "Rating (Stars)", "Stock Count", "Weight (kg)"]

    # Construct design matrix X (with bias column 1) and target vector y
    X_raw = []
    y_raw = []
    names = []

    for p in products:
        names.append(p["name"])
        price = float(p["price"])
        velocity = float(p["monthly_units_velocity"])
        rating = float(p["rating"])
        stock = float(p["stock_count"])
        weight = float(p["weight_kg"])
        actual_demand = float(p["actual_30d_demand"])

        X_raw.append([1.0, price, velocity, rating, stock, weight])
        y_raw.append(actual_demand)

    X = np.array(X_raw, dtype=float)
    y = np.array(y_raw, dtype=float)

    # Normal Equation: Beta = (X^T * X)^(-1) * X^T * y
    # Uses pseudo-inverse for robust numerical stability against multicollinearity
    Xt = X.T
    XtX = np.dot(Xt, X)
    XtX_inv = np.linalg.pinv(XtX)
    Xty = np.dot(Xt, y)
    beta = np.dot(XtX_inv, Xty)

    # Predictions and Evaluation
    y_pred = np.dot(X, beta)

    y_mean = np.mean(y)
    ss_total = np.sum((y - y_mean) ** 2)
    ss_residual = np.sum((y - y_pred) ** 2)
    r_squared = 1.0 - (ss_residual / ss_total)

    k = len(feature_names) # number of predictors
    adj_r_squared = 1.0 - ((1.0 - r_squared) * (n - 1) / (n - k - 1))

    mae = np.mean(np.abs(y - y_pred))
    mse = np.mean((y - y_pred) ** 2)
    rmse = math.sqrt(mse)

    print(f"Total Product Records:       {n} commercial SKUs")
    print("-" * 78)
    print("Multiple Regression Beta Coefficients:")
    print(f"  β₀ (Intercept):            {beta[0]:+.4f}")
    for idx, f_name in enumerate(feature_names, start=1):
        print(f"  β_{idx} ({f_name:<18}): {beta[idx]:+.6f}")
    print("-" * 78)

    print(f"Multiple Linear Regression Model Equation:")
    print(f"  Demand = {beta[0]:.2f}")
    for idx, f_name in enumerate(feature_names, start=1):
        sign = "+" if beta[idx] >= 0 else "-"
        print(f"           {sign} {abs(beta[idx]):.5f} * {f_name}")
    print("-" * 78)

    print("Model Evaluation Metrics:")
    print(f"  R-Squared (R²):            {r_squared:.4f} ({r_squared * 100:.2f}% variance explained)")
    print(f"  Adjusted R-Squared:        {adj_r_squared:.4f}")
    print(f"  Mean Absolute Error (MAE): {mae:.2f} units")
    print(f"  Mean Squared Error (MSE):  {mse:.2f}")
    print(f"  Root Mean Squared Error:   {rmse:.2f} units")
    print("-" * 78)

    # Show Top Samples Actual vs Predicted
    print(f"{'Product SKU':<36} {'Actual Demand':<15} {'Predicted':<12} {'Error':<8}")
    print("-" * 75)
    sample_outputs = []
    for i in range(min(10, n)):
        err = y[i] - y_pred[i]
        short_name = names[i][:34]
        print(f"{short_name:<36} {int(y[i]):<15} {y_pred[i]:<12.1f} {err:+.1f}")
        sample_outputs.append({
            "product_name": names[i],
            "actual_demand": int(y[i]),
            "predicted_demand": round(float(y_pred[i]), 1),
            "residual_error": round(float(err), 1)
        })

    return {
        "model_type": "Multiple Linear Regression (MLR)",
        "target_variable": "30-Day Unit Demand",
        "sample_size": n,
        "features": feature_names,
        "coefficients": {
            "intercept_beta_0": round(float(beta[0]), 4),
            "beta_price": round(float(beta[1]), 6),
            "beta_velocity": round(float(beta[2]), 6),
            "beta_rating": round(float(beta[3]), 4),
            "beta_stock": round(float(beta[4]), 6),
            "beta_weight": round(float(beta[5]), 4)
        },
        "r_squared": round(float(r_squared), 4),
        "adjusted_r_squared": round(float(adj_r_squared), 4),
        "mae": round(float(mae), 3),
        "rmse": round(float(rmse), 3),
        "sample_outputs": sample_outputs
    }

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    prods_csv = os.path.join(base_dir, 'touchpower_products_dataset.csv')

    slr_results = run_simple_linear_regression()
    mlr_results = run_multiple_linear_regression(prods_csv)

    output_json = os.path.join(base_dir, 'regression_results.json')
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump({"slr": slr_results, "mlr": mlr_results}, f, indent=2)

    print(f"\n✓ Linear Regression models successfully evaluated and saved to: {output_json}")
