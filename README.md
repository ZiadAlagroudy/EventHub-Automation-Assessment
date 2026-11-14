# EventHub — QA Automation Framework

A UI and API test automation framework built with **Playwright and TypeScript** to validate the ticket-booking workflow in EventHub.

This project was developed as part of a QA Automation Practical Assessment, focusing on **US-114: Book tickets for an event**.

## 1. Project Overview

**Application:** EventHub
**Web Application:** [https://eventhub.rahulshettyacademy.com](https://eventhub.rahulshettyacademy.com)
**API Documentation:** [https://api.eventhub.rahulshettyacademy.com/api/docs/](https://api.eventhub.rahulshettyacademy.com/api/docs/)

### User Story — US-114

As a visitor to EventHub, I want to book tickets for an event so that I can attend it.

The automation covers:

- Creating bookings through the UI and REST API.
- Validating ticket quantities and total prices.
- Verifying booking references and booking details.
- Checking that bookings appear in My Bookings.
- Cancelling bookings and verifying seat restoration.
- Testing selected negative scenarios and boundary conditions.

## 2. Technology Stack

| Component            | Technology                                          |
| -------------------- | --------------------------------------------------- |
| Programming language | TypeScript                                          |
| Test automation      | Playwright Test                                     |
| UI browser           | Chromium                                            |
| API testing          | Playwright APIRequestContext                        |
| Design pattern       | Page Object Model                                   |
| Authentication       | Reusable authenticated fixtures                     |
| Configuration        | Environment variables and centralized configuration |
| Test data            | Dynamic data factories                              |
| Reporting            | Playwright HTML Reporter                            |
| Version control      | Git and GitHub                                      |

## 3. Framework Architecture

The framework separates test scenarios from UI interactions, API operations, authentication, configuration, and test data generation.

```text
EventHub Automation
├── API/
│   └── clients/
│       ├── authClients.ts
│       ├── BookingsClient.ts
│       └── EventsClient.ts
├── fixtures/
│   ├── apiFixtures.ts
│   ├── uiFixtures.ts
│   └── testFixtures.ts
├── pages/
│   ├── eventsPage.ts
│   ├── loginPage.ts
│   └── myBookingsPage.ts
├── tests/
│   ├── api/
│   │   ├── authentication.api.spec.ts
│   │   ├── booking.api.spec.ts
│   │   ├── events.api.spec.ts
│   │   └── health.api.spec.ts
│   └── ui/
│       ├── auth.ui.spec.ts
│       └── booking.ui.spec.ts
├── utils/
│   ├── config.ts
│   └── testData.ts
├── .env.sample
├── .gitignore
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

### Architectural Decisions

**Page Object Model (POM):** UI locators and interactions are encapsulated in page classes. This reduces duplication and allows UI changes to be handled centrally.

**API Clients:** API endpoints are wrapped in dedicated client classes, separating HTTP operations from test assertions.

**Authentication Fixtures:** Authentication is handled centrally. API tests can use an authenticated request context, while UI tests can use an authenticated browser page. Individual tests do not need to implement the login process.

**Reusable Test Data:** Events and bookings are generated dynamically to improve test independence and reduce dependence on existing records.

**Centralized Configuration:** Application URLs and credentials are configured through environment variables rather than being repeated across tests.

**Test Cleanup:** Tests attempt to remove created bookings and events after execution, including when assertions fail. Cleanup is best-effort and depends on the availability of the API and successful capture of created resource identifiers.

These decisions allow additional pages, endpoints, fixtures, and test suites to be introduced without restructuring the framework.

## 4. Installation and Setup

### Prerequisites

- Node.js and npm
- Git
- An EventHub account

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

Install dependencies:

```bash
npm ci
```

Install Chromium:

```bash
npx playwright install chromium
```

### Environment Configuration

Create a `.env` file in the project root using `.env.sample` as a reference.


EVENTHUB_EMAIL=your-account-email
EVENTHUB_PASSWORD=your-account-password

UI_BASE_URL=https://eventhub.rahulshettyacademy.com/
API_BASE_URL=https://api.eventhub.rahulshettyacademy.com/api/

The `.env` file is excluded from version control to avoid exposing credentials.

## 5. Running the Tests

Run the complete test suite:

```bash
npm test
```

Run API tests only:

```bash
npm run test:api
```

Run UI tests only:

```bash
npm run test:ui
```

List discovered tests:

```bash
npm run test:list
```

Run TypeScript validation:

```bash
npm run typecheck
```

Open the HTML report:

```bash
npm run test:report
```

Tests currently run against Chromium using a single worker. This was selected for predictable execution in the shared public test environment.

## 6. Test Strategy and Coverage

The test strategy combines UI end-to-end validation with API-level testing.

UI tests verify the customer-facing booking experience, while API tests validate booking operations, business rules, and backend state changes more directly.

### UI Coverage

| Scenario                           | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| Book tickets and cancel booking    | Validate the complete booking lifecycle             |
| Booking with invalid email         | Verify input validation                             |
| Ticket quantity boundaries         | Validate minimum and maximum quantities             |
| Booking with empty required fields | Verify required-field validation                    |
| Dismiss booking cancellation       | Ensure declining cancellation preserves the booking |

### API Coverage

| Area                                | Purpose                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| API health                          | Verify service availability                                 |
| Authentication                      | Verify authenticated access to protected endpoints          |
| Event creation and retrieval        | Validate event setup and retrieval                          |
| Booking creation                    | Validate booking creation and response details              |
| Booking price and seat availability | Verify business calculations and inventory changes          |
| Booking cancellation                | Verify cancellation and seat restoration                    |
| Invalid quantities                  | Verify rejection of quantities outside accepted boundaries  |
| Insufficient seats                  | Verify rejection when requested tickets exceed availability |

Additional UI authentication coverage is included.

**Latest local regression result:** 13 tests passed.

### Why These Tests Were Selected

The assessment focuses on a single booking flow, so coverage prioritizes:

1. The core business journey and all five acceptance criteria.
2. Price and seat availability, where defects could have significant business impact.
3. Input validation and quantity boundaries.
4. Cancellation behavior, including the user's decision not to proceed.
5. Backend verification to avoid relying exclusively on UI messages.

The intention is to provide meaningful risk-based coverage rather than maximize the number of tests.

## 7. User Story Review — US-114

### Acceptance Criteria Assessment

| AC  | Requirement                                                                       | Coverage                             |
| --- | --------------------------------------------------------------------------------- | ------------------------------------ |
| AC1 | Select tickets, enter customer information, confirm booking and receive reference | UI E2E booking test                  |
| AC2 | Total equals unit price multiplied by quantity                                    | UI and API assertions                |
| AC3 | Booking appears in My Bookings                                                    | UI E2E verification                  |
| AC4 | Booking can be cancelled                                                          | UI and API cancellation verification |
| AC5 | Booking works through POST /api/bookings                                          | API booking creation test            |

### Missing or Unclear Requirements

**1. Visitor versus authenticated user**

The story refers to a visitor, but the tested booking flow uses authentication.

**Question for PO:** Should unauthenticated visitors be allowed to book tickets, or is login mandatory?

**2. Ticket quantity limits**

The UI supports quantities from 1 to 10, but the story does not define these limits.

**Question for PO:** Is 10 the maximum quantity per booking? Should this limit also depend on available seats?

**3. Customer information validation**

The story requires name, email, and phone but does not specify validation rules.

**Question for PO:** What are the required formats, lengths, and supported international phone numbers?

**4. Booking cancellation rules**

The story states that users can cancel bookings but does not define restrictions.

**Question for PO:** Can bookings be cancelled at any time? Are there cancellation deadlines, refunds, or fees?

**5. Seat availability and concurrency**

The story does not specify how simultaneous booking requests should be handled.

**Question for PO:** How should the system prevent overselling when multiple users book the remaining seats concurrently?

**6. Pricing rules**

The story specifies a basic multiplication formula but does not address taxes, discounts, fees, or currency.

**Question for PO:** Should the displayed total include additional charges or discounts, and what currency should be used?

**7. Duplicate bookings**

The story does not explain whether customers can create multiple bookings for the same event.

**Question for PO:** Are duplicate bookings permitted, and should repeated API requests be protected against accidental duplication?

**8. Booking confirmation and failure handling**

The expected behavior for unsuccessful bookings is not defined.

**Question for PO:** What messages should users receive for insufficient seats, server errors, or network failures? Should booking confirmation include an email or SMS?

**9. My Bookings ownership**

The relationship between a booking's customer email and the authenticated account is not defined.

**Question for PO:** Should My Bookings show only bookings belonging to the logged-in account, and how is ownership determined?

## 8. Observed Application and API Behaviors

The following observations were made during test development and execution. They are not all confirmed defects.

| Observation                                                           | Classification               | Impact / Follow-up                                                    |
| --------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| Event price is returned as a string in API responses                  | API response behavior        | Clarify the expected response schema and data type                    |
| Booking cancellation removes the booking and restores available seats | Observed behavior            | Clarify whether cancellation should retain a historical record        |
| Ticket selection is restricted to quantities 1–10                     | Observed behavior            | Document the quantity rule in the acceptance criteria                 |
| Booking flow requires an authenticated test session                   | Requirement ambiguity        | Clarify the meaning of “visitor”                                      |
| A transient connection reset occurred during a test run               | Test environment observation | Not classified as an application defect without reproducible evidence |

The automation normalizes numeric values when comparing API prices.

## 9. Assumptions and Limitations

### Assumptions

- A registered EventHub account is available for automated execution.
- Each test can create isolated event data through the API.
- The public test environment is suitable for creating and deleting test records.
- Booking quantities outside the accepted range should be rejected.
- A cancelled booking should release its reserved seats.

### Current Limitations

- UI execution is limited to Chromium.
- The framework has not been validated under concurrent execution.
- Cleanup is best-effort; network failures or missing resource identifiers can prevent deletion.
- The suite does not currently cover high-volume or concurrent booking requests.

## 10. Improvements With More Time

**Higher priority**

- Introduce reusable test-data lifecycle fixtures for automatic cleanup.
- Improve resource recovery and cleanup after partial API failures.
- Expand negative tests for invalid customer data, unauthorized access, and missing resources.
- Add API schema validation and clearer error diagnostics.

**Further enhancements**

- Add GitHub Actions for automated execution on pushes.
- Extend browser coverage to Firefox and WebKit.
- Validate safe parallel execution with isolated accounts and test data.
- Add concurrency tests for the final available seats.
- Add structured test tags and more detailed reporting.
- Introduce environment-specific execution profiles.

## 11. Security and Test Data

- Credentials are stored in environment variables and excluded from Git.
- Authentication tokens are managed by reusable fixtures.
- Tests generate dedicated data instead of modifying unrelated records.
- Created resources are cleaned up wherever possible.
- Reviewers should receive credentials through the assessment submission process, not through committed source files.