# Report Card: Tokens Consumptions

**Date:** 2025-10-01
**Company:** Tech-Corp
**Position:** Senior Frontend Engineer - Web

---

## Resource Summary

| Metric              | job-analysis | tailor-resume-and-cover | **Two-Agent Total** | Reference | **job-tailor** | **Difference**     |
| ------------------- | ------------ | ----------------------- | ------------------- | --------- | -------------- | ------------------ |
| **Execution Time**  | 1m 10s       | 2m 16s                  | **3m 26s**          | 7m 49s    | **4m 25s**     | **+59s**           |
| **Total Tokens**    | 30,900       | 36,800                  | **67,700**          | 51,400    | **52,300**     | **-15,400 (-23%)** |
| **Tool Uses**       | 8            | 22                      | **30**              | 33        | **30**         | **0**              |
| **Files Generated** | 2            | 2                       | **4**               | 3         | **4**          | **0**              |

**Legend:**

- **job-analysis**: Extracts job requirements and creates structured analysis (metadata.yaml + job_analysis.yaml)
- **tailor-resume-and-cover**: Customizes resume and cover letter based on job analysis (resume.yaml + cover_letter.yaml)
- **Two-Agent Total**: Sequential workflow running both agents above (original approach)
- **Reference**: Initial unified agent (v0.6) combining both analysis and tailoring in one workflow (baseline)
- **job-tailor**: Optimized unified agent (v0.7) with improved efficiency and faster execution
- **Difference**: Comparison between job-tailor (v0.7) and Two-Agent Total approach

---

## Cost Estimation

**Claude Sonnet 4.5 Pricing:** $3.00/M input tokens, $15.00/M output tokens

### Output File Analysis

Both approaches generate identical files with schema-enforced character limits:

| File              | Size (bytes) | Approx. Tokens |
| ----------------- | ------------ | -------------- |
| metadata.yaml     | 1,556        | ~500           |
| job_analysis.yaml | 4,822        | ~1,550         |
| resume.yaml       | 5,470        | ~1,750         |
| cover_letter.yaml | 3,204        | ~1,025         |
| **Total Output**  | **15,052**   | **~4,825**     |

**Key Insight:** Output tokens are nearly identical due to schema constraints. Token differences are primarily in **input processing efficiency**.

### Two-Agent Approach (job-analysis + tailor-resume-and-cover)

| Token Type | Count      | Rate     | Cost      |
| ---------- | ---------- | -------- | --------- |
| Input      | 62,875     | $3.00/M  | $0.19     |
| Output     | 4,825      | $15.00/M | $0.07     |
| **Total**  | **67,700** | -        | **$0.26** |

### Single-Agent Approach (job-tailor)

| Token Type | Count      | Rate     | Cost      |
| ---------- | ---------- | -------- | --------- |
| Input      | 47,475     | $3.00/M  | $0.14     |
| Output     | 4,825      | $15.00/M | $0.07     |
| **Total**  | **52,300** | -        | **$0.21** |

### Cost Comparison

**Savings with job-tailor:** $0.05 (19% reduction)

**Efficiency gain:** 15,400 fewer input tokens (-24.5%) with unified workflow, demonstrating better context management and reduced duplication between agent invocations.
