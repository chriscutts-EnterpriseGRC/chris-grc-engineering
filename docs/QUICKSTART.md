# Quick Start Guide

Welcome to the GRC Engineering Portfolio. This guide will help you quickly understand and navigate the project structure.

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/9snxz8htcw-netizen/chris-grc-engineering
   cd chris-grc-engineering
   ```

2. **Explore the Documentation**
   - Start with `README.md` for an overview
   - Review `docs/ARCHITECTURE.md` for system architecture
   - Check `docs/METHODOLOGY.md` for implementation approach
   - Examine `case-study/CASE_STUDY.md` for real-world application

3. **View Interactive Diagrams**
   - Open `diagrams/` in your browser
   - Interactive HTML visualizations are available for:
     - Risk Architecture
     - Domain Taxonomy
     - Health Score Algorithm
     - Dashboard Views

## Project Structure

```
chris-grc-engineering/
├── README.md                       # Project overview
├── LICENSE                         # MIT License
├── dashboard/                      # React application
│   ├── src/
│   │   ├── GRCDashboard.jsx        # Main dashboard — all modules
│   │   └── lib/
│   │       ├── supabase.js         # Supabase client (null if unconfigured)
│   │       └── api.js              # Data access layer with mock fallback
│   ├── integrations/
│   │   ├── jira.js                 # Jira → incidents
│   │   ├── qualys.js               # Qualys → vulnerabilities
│   │   ├── splunk.js               # Splunk → incidents
│   │   └── sync.js                 # Sync runner
│   └── .env.example                # Credential template
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Full schema with RLS
│   └── seed.sql                    # Enriched demo data
├── docs/                           # Supporting documentation
├── case-study/                     # Implementation case study
├── diagrams/                       # Interactive HTML visualizations
├── plugins/                        # Connector plugins
├── schemas/                        # JSON schemas
└── tests/                          # Test suite
```

## Key Concepts

### GRC Engineering
Governance, Risk, and Compliance (GRC) engineering focuses on building systematic approaches to:
- **Governance**: Establishing policies and decision-making frameworks
- **Risk Management**: Identifying, assessing, and mitigating risks
- **Compliance**: Ensuring adherence to regulations and standards

### Health Scores
The portfolio demonstrates a quantitative approach to measuring organizational health through:
- Risk exposure metrics
- Compliance adherence scores
- Operational efficiency indicators

## Next Steps

1. Read the [Architecture Documentation](ARCHITECTURE.md) to understand the system design
2. Review the [Case Study](../case-study/CASE_STUDY.md) for practical implementation
3. Explore the [Interactive Diagrams](../diagrams/) for visual understanding
4. Check the [FAQ](FAQ.md) for common questions

## Support

For questions or feedback, please refer to the project repository or contact the maintainers.
