# Credit_Card_Froud_Dection-System
frontend/
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── router.jsx
│   │
│   ├── api/
│   │   ├── client.js
│   │   ├── transactions.js
│   │   ├── alerts.js
│   │   ├── investigations.js
│   │   ├── models.js
│   │   └── auth.js
│   │
│   ├── hooks/
│   │   ├── useTransactions.js
│   │   ├── useTransaction.js
│   │   ├── useAlerts.js
│   │   ├── useAlertStream.js
│   │   ├── useInvestigation.js
│   │   ├── useModelMetrics.js
│   │   ├── useFeatureDrift.js
│   │   └── useAuth.js
│   │
│   ├── store/
│   │   ├── uiStore.js
│   │   ├── filterStore.js
│   │   └── sessionStore.js
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Panel.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Drawer.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Tabs.jsx
│   │   │   └── Skeleton.jsx
│   │   │
│   │   ├── domain/
│   │   │   ├── RiskScoreBadge.jsx
│   │   │   ├── SeverityTag.jsx
│   │   │   ├── StatusPill.jsx
│   │   │   ├── ReasonCodeList.jsx
│   │   │   ├── StatTile.jsx
│   │   │   └── ModelVersionTag.jsx
│   │   │
│   │   ├── charts/
│   │   │   ├── RiskTrendChart.jsx
│   │   │   ├── MetricTrendChart.jsx
│   │   │   ├── DriftTable.jsx
│   │   │   └── PredictionDistributionChart.jsx
│   │   │
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       ├── TopBar.jsx
│   │       └── PageHeader.jsx
│   │
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── TransactionsPage.jsx
│   │   ├── AlertsPage.jsx
│   │   ├── ModelMonitoringPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── investigation/
│   │       ├── InvestigationPage.jsx
│   │       ├── CustomerHistoryTab.jsx
│   │       ├── DeviceHistoryTab.jsx
│   │       ├── MerchantHistoryTab.jsx
│   │       └── DecisionPanel.jsx
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── riskBands.js
│   │   └── permissions.js
│   │
│   └── styles/
│       └── index.css
│
└── tests/
    ├── components/
    ├── hooks/
    └── pages/
#First 
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm.cmd install react-router-dom axios zustand @tanstack/react-query recharts lucide-react
npm install react-router-dom axios zustand @tanstack/react-query recharts lucide-react