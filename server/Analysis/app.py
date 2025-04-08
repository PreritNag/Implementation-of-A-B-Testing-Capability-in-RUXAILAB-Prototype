from flask import Flask, request, jsonify
import numpy as np
import pymc3 as pm
from scipy.stats import chi2_contingency

app = Flask(__name__)

# -------------------------------
# Bayesian A/B Testing
# -------------------------------
def run_bayesian(control_success, control_total, variation_success, variation_total):
    with pm.Model() as model:
        # Priors
        p_control = pm.Beta("p_control", alpha=1, beta=1)
        p_variation = pm.Beta("p_variation", alpha=1, beta=1)

        # Likelihoods
        obs_control = pm.Binomial("obs_control", n=control_total, p=p_control, observed=control_success)
        obs_variation = pm.Binomial("obs_variation", n=variation_total, p=p_variation, observed=variation_success)

        # Deterministic difference
        delta = pm.Deterministic("delta", p_variation - p_control)

        # Sampling
        trace = pm.sample(2000, tune=1000, cores=1, progressbar=False)

    prob_better = float(np.mean(trace["delta"] > 0))
    delta_mean = float(np.mean(trace["delta"]))
    delta_hdi = [
        float(np.percentile(trace["delta"], 2.5)),
        float(np.percentile(trace["delta"], 97.5)),
    ]

    return {
        "type": "bayesian",
        "prob_better": prob_better,
        "delta_mean": delta_mean,
        "delta_hdi": delta_hdi,
        "recommendation": "Use variation" if prob_better > 0.95 else "Collect more data",
    }

# -------------------------------
# Chi-Square A/B Testing
# -------------------------------
def run_chisquare(control_success, control_total, variation_success, variation_total):
    table = [
        [control_success, control_total - control_success],
        [variation_success, variation_total - variation_success],
    ]

    chi2, p, dof, expected = chi2_contingency(table)
    return {
        "type": "frequentist",
        "chi2_stat": chi2,
        "p_value": p,
        "significant": p < 0.05,
        "recommendation": "Statistically significant" if p < 0.05 else "Not enough evidence",
    }

# -------------------------------
# Universal Endpoint
# -------------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        control = data["control"]
        variation = data["variation"]
        algorithm = data.get("algorithm", "bayesian").lower()

        control_success = control["success"]
        control_total = control["total"]
        variation_success = variation["success"]
        variation_total = variation["total"]

        if algorithm == "bayesian":
            result = run_bayesian(control_success, control_total, variation_success, variation_total)
        elif algorithm in ["frequentist", "chi2", "chisquare"]:
            result = run_chisquare(control_success, control_total, variation_success, variation_total)
        else:
            return jsonify({"success": False, "error": "Invalid algorithm"}), 400

        return jsonify({
            "success": True,
            "algorithm": result["type"],
            "result": result,
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# -------------------------------
#  Run Server
# -------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
