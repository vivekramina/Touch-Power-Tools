# TouchPower™ Data Warehousing & Data Mining (DWM) Analysis

This directory contains the complete Python machine learning and predictive analytics suite implementing core Data Warehousing and Data Mining (DWM) curriculum topics on real-world e-commerce & construction tool logistics data.

---

## 📚 Topics Implemented

### 1. Simple Linear Regression (SLR) & Multiple Linear Regression (MLR)
* **File:** [`1_linear_regression.py`](./1_linear_regression.py)
* **Dataset:** 12-month historical & projected revenue flow, and 32 catalog products ([`touchpower_products_dataset.csv`](./touchpower_products_dataset.csv)).
* **Simple Linear Regression (SLR):**
  - **Equation:** $\hat{Y} = \beta_0 + \beta_1 X$
  - Predicts **Monthly Gross Revenue (₹ Lakhs)** from **Monthly Order Volume**.
  - **Derivation (OLS):**
    $$\beta_1 = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}, \quad \beta_0 = \bar{y} - \beta_1 \bar{x}$$
  - **Fitted Model:** $\text{Revenue (₹L)} = 0.5756 + 0.1912 \times \text{Orders}$
  - **Metrics:** $R^2 = 1.0000$, Pearson $r = 1.0000$, MAE = ₹0.079L.
* **Multiple Linear Regression (MLR):**
  - **Equation:** $\hat{Y} = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \beta_3 X_3 + \beta_4 X_4 + \beta_5 X_5$
  - Predicts **30-Day Demand Units** using:
    - $X_1$: Unit Price (₹)
    - $X_2$: Monthly Velocity (Past Run-Rate Units)
    - $X_3$: Verified Contractor Rating (Stars)
    - $X_4$: Current Warehouse Stock Level
    - $X_5$: Package Weight (kg)
  - **Matrix Normal Equation:** $\mathbf{\beta} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{y}$
  - **Metrics:** $R^2 = 0.9824$ (98.24% variance explained), Adjusted $R^2 = 0.9790$, MAE = 4.43 units, RMSE = 7.04 units.

---

### 2. Attribute Relevance Analysis & Decision Tree Classification
* **File:** [`2_attribute_relevance_decision_tree.py`](./2_attribute_relevance_decision_tree.py)
* **Target Concept:** `Reorder_Urgency` (`Critical Urgent`, `Restock Warning`, `Optimal Buffer`).
* **Attribute Relevance Analysis:**
  - Evaluates feature informativeness using **Entropy**, **Information Gain** (ID3), **Gain Ratio** (C4.5), and **Gini Index** (CART):
    $$\text{Entropy}(S) = - \sum_{i=1}^{c} p_i \log_2(p_i)$$
    $$\text{Gain}(S, A) = \text{Entropy}(S) - \sum_{v \in \text{Values}(A)} \frac{|S_v|}{|S|} \text{Entropy}(S_v)$$
    $$\text{GainRatio}(S, A) = \frac{\text{Gain}(S, A)}{\text{SplitInfo}_A(S)}$$
  - **Ranking Results:**
    1. **Stock_Level** (Gain = 0.8749 bits, Gini Red. = 0.3239) — *Primary Driver*
    2. **Days_Of_Supply** (Gain = 0.6496 bits, Gain Ratio = 0.6998) — *Root Node*
    3. **Price_Tier** (Gain = 0.3279 bits)
    4. **Sales_Velocity** (Gain = 0.2749 bits)
    5. **Lead_Time** (Gain = 0.2224 bits)
    6. **Category** (Gain = 0.0529 bits — *Low Relevance / Pruned*)
* **Decision Tree Induction:**
  - Induced using recursive information gain maximization.
  - Generates transparent IF-THEN rules for inventory managers.
  - **Classification Accuracy:** **93.75%** (30 of 32 SKUs classified correctly).

---

### 3. Naïve Bayes Classification with Comprehensive Model Evaluation
* **File:** [`3_naive_bayes_classification.py`](./3_naive_bayes_classification.py)
* **Target Concept:** Consignment Delivery SLA & Return Risk (`On-Time / Delivered` vs `Delayed / Returned`).
* **Bayes' Theorem Formulation:**
  $$P(C_k | X) = \frac{P(C_k) \prod_{i=1}^d P(x_i | C_k)}{P(X)}$$
  - Includes **Laplace Add-1 Smoothing** for categorical features:
    $$P(x_i = v | C_k) = \frac{\text{count}(x_i = v, C_k) + 1}{\text{total}(C_k) + |V_i|}$$
  - Includes **Gaussian Likelihood** for continuous package weight:
    $$P(x | \mu, \sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)$$
* **Model Evaluation Metrics (Hold-out Test Set of 20 Consignments):**
  - **Accuracy:** $100.0\%$ (or $95.0\%$ with categorical tiering)
  - **Confusion Matrix:**
    - True Positives (TP): 14
    - False Positives (FP): 0 (or 1)
    - False Negatives (FN): 0
    - True Negatives (TN): 6 (or 5)
  - **Precision:** $TP / (TP + FP) = 14 / (14 + 0) = 100.0\%$ (or $93.3\%$)
  - **Recall:** $TP / (TP + FN) = 14 / (14 + 0) = 100.0\%$
  - **F1-Score:** $2 \times \frac{P \times R}{P + R} = 100.0\%$ (or $96.6\%$)
  - **Specificity:** $TN / (TN + FP) = 100.0\%$

---

## 🚀 How to Run the Python Pipeline

```bash
# 1. Run all models at once:
python scripts/dwm_analysis/run_all_dwm_models.py

# 2. Or run individual models:
python scripts/dwm_analysis/1_linear_regression.py
python scripts/dwm_analysis/2_attribute_relevance_decision_tree.py
python scripts/dwm_analysis/3_naive_bayes_classification.py
```

All trained parameters, rules, and evaluation metrics are automatically exported into:
- `regression_results.json`
- `decision_tree_results.json`
- `naive_bayes_results.json`
- `dwm_model_results.json`

---

## 🖥️ Operations Admin Integration

Both Regression Analysis features are integrated directly into the TouchPower Operations Admin console:
1. **Dedicated Sidebar Tab**: Click **`📈 Regression Studio (SLR & MLR)`** in the Admin sidebar to open the full-screen interactive studio.
2. **Simple Linear Regression (SLR)**:
   - Dynamic Order Volume slider ($10 - 1000$ orders) with instant revenue calculation in ₹ Lakhs & Indian Rupees.
   - Live step-by-step arithmetic formula substitution: $\hat{Y} = 0.57564 + (0.19123 \times X)$.
   - 12-month historical actual vs OLS fitted comparison table.
3. **Multiple Linear Regression (MLR)**:
   - 5-variable predictor sliders ($X_1$ Price, $X_2$ Velocity, $X_3$ Rating, $X_4$ Stock, $X_5$ Weight).
   - Commercial SKU preset dropdown (Rotary Hammer Drill, Industrial Miter Saw, Heavy Angle Grinder, etc.).
   - Live predicted 30-day demand units, gross revenue, days of stock, and stockout alert triage.
   - Full 32-SKU catalog multi-attribute live demand table with search and demand tier filters.
4. **Live Python Execution**:
   - 1-click **"EXECUTE PYTHON REGRESSION SCRIPT"** button that runs `1_linear_regression.py` on the system and prints output in real-time to the admin terminal viewport.

