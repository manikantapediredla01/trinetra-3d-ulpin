# TRINETRA Quantum Optimization Subsystem (QUBO & QAOA)

This module implements the mathematical and quantum optimization algorithms for 3D property boundary configuration selection in TRINETRA.

---

## 1. Problem Formulation: Spatial QUBO

In urban 3D property modeling, point clouds and sensor evidence often yield multiple plausible volumetric boundary hypotheses. The selection of the optimal 3D configuration across vertical strata is modeled as a binary optimization problem.

For $n$ candidate spatial configurations, define binary decision variables:
$$x_i \in \{0, 1\}, \quad i \in \{0, 1, \dots, n-1\}$$

Where $x_i = 1$ if candidate $i$ is selected, and $x_i = 0$ otherwise.

### Objective Cost Function
$$C_{\text{geom}}(x) = \sum_{i=0}^{n-1} \left( w_o O_i + w_g G_i + w_b B_i + w_f F_i + w_t (1 - T_i) \right) x_i$$

Where:
- $O_i$: Overlap volume score ($[0, 1]$)
- $G_i$: Gap volume score ($[0, 1]$)
- $B_i$: RMS boundary deviation in meters
- $F_i$: Floor elevation error in meters
- $T_i$: Manifold topology score ($[0, 1]$)

### Unconstrained Penalty Formulation (QUBO)
To enforce the selection of exactly one valid candidate configuration ($\sum_{i=0}^{n-1} x_i = 1$), a quadratic penalty with multiplier $\lambda$ is added:

$$P(x) = \lambda \left( \sum_{i=0}^{n-1} x_i - 1 \right)^2 = \lambda \left( \sum_{i=0}^{n-1} x_i^2 + 2 \sum_{i < j} x_i x_j - 2 \sum_{i=0}^{n-1} x_i + 1 \right)$$

Since $x_i^2 = x_i$ for binary variables:
$$P(x) = -\lambda \sum_{i=0}^{n-1} x_i + 2\lambda \sum_{i < j} x_i x_j + \lambda$$

The total objective is expressed as the upper-triangular QUBO matrix $Q$:
$$\min_{x} x^T Q x$$

---

## 2. Ising Hamiltonian Mapping for Quantum Gates

Using the standard transformation from binary variables $x_i \in \{0, 1\}$ to Pauli-Z spin operators $\hat{Z}_i \in \{-1, +1\}$:
$$x_i = \frac{I - \hat{Z}_i}{2}$$

The Cost Hamiltonian $H_C$ is expressed as:
$$H_C = \sum_{i=0}^{n-1} h_i \hat{Z}_i + \sum_{i < j} J_{ij} \hat{Z}_i \hat{Z}_j$$

---

## 3. Quantum Approximate Optimization Algorithm (QAOA)

QAOA prepares the parameterized state $|\psi(\gamma, \beta)\rangle$ through $p$ alternating layers of cost unitary $U(H_C, \gamma)$ and transverse mixer unitary $U(H_M, \beta)$:

$$|\psi(\gamma, \beta)\rangle = \prod_{k=1}^{p} \left( e^{-i \beta_k H_M} e^{-i \gamma_k H_C} \right) |+\rangle^{\otimes n}$$

Where $H_M = \sum_{i=0}^{n-1} \hat{X}_i$ and $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$.

The expectation value is minimized using the classical **COBYLA** optimizer:
$$\min_{\gamma, \beta} \langle \psi(\gamma, \beta) | H_C | \psi(\gamma, \beta) \rangle$$

---

## 4. Usage & Execution

```bash
# Run standalone QAOA solver benchmark
python qaoa_solver.py
```
