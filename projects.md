 Portfolio Projects

### JOEL APPS
- **Title:** Joel apps
- **Description:** An enterprise mobile application structured within a complex monorepo ecosystem. It features a highly decoupled UI system natively adapted for accessibility.
- **About App**
Joel App distinguishes itself from standard gig-economy platforms by operating as a comprehensive, closed-loop service fulfillment ecosystem. It goes beyond simple matchmaking by integrating pre-job logistics (such as precise tool requisitions for specific trades) and a dynamic transaction state machine capable of handling complex, mid-service workflow changes like price renegotiations.

Platform Overview & Core Workflow:

- Client Procurement & Secure Transactions: Users seamlessly request specialized home services (e.g., plumbing, electrical work) through the client-facing application, with upfront fee processing handled securely within the platform.

- Smart Gig Dispatch: Service orders are dynamically broadcast to a network of qualified service partners. The decentralized dispatch system grants professionals the autonomy to evaluate and accept or reject gigs based on their schedule and the job's scope.

- Pre-Job Logistics & Integrated Routing: Upon accepting a gig, the application acts as a logistical assistant, displaying a highly specific checklist of tools required for the task. Integrated geolocation and mapping services then route the partner directly to the client's location.

- Automated Invoicing & Reconciliation: Following job completion, service providers trigger a system-generated, pre-calculated invoice. This automates the payment release, ensuring frictionless and immediate compensation.

- Dynamic Edge-Case Management: The platform is engineered to autonomously manage complex lifecycle events beyond the standard "happy path." It features robust resolution protocols for cancellations, mid-service scope changes, and dynamic price renegotiations, ensuring fair and transparent mediation for both clients and partners.
- **Role and Contribution:** Architected and deployed the Flutter monorepo using Melos. Developed a state-agnostic UI system using custom Flutter Hooks and Widgetbook. Built a dedicated statemanagement package `Effectum` to convert emitted states from bloc pattern to ui reducer page events, Implemented feature-level modular architecture, secured the backend via Firebase Auth SSO, and automated CI/CD pipelines via Fastlane and GitHub Actions to deliver the MVP in under 5 months.
- **Links:** 
  - Appstore: TBD
  - Playstore: TBD
  - Github: TBD
  - Company Website: TBD
- **Images:** 
  - Hero Sliders: 
    - /assets/joel/joel_mockup.jpeg
    - /assets/joel/joel_mockup2.jpeg 
  - Other Images: 
    - /assets/joel/image 3.png
    - /assets/joel/image 5.png
    - /assets/joel/image 6.png
    - /assets/joel/image 7.png
    - /assets/joel/image 8.png
    - /assets/joel/image 9.png
    - /assets/joel/image 10.png
    - /assets/joel/image 11.png
    - /assets/joel/image 12.png
- **Duration:** September 2025 – Present

---

### Lifebonder
- **Title:** Lifebonder
- **Description:** A cross-platform social networking application centered around privacy, featuring native WebRTC-based communication and group chats.
- **About App:**Lifebonder redefines the modern social networking landscape by merging hyper-personalized, AI-driven matchmaking with uncompromising privacy and real-time connectivity. Unlike traditional social platforms that rely on passive scrolling, it actively curates authentic, localized interactions through granular behavioral telemetry—all while securing user data within an encrypted communication pipeline and ensuring seamless operation in volatile network conditions via a robust offline-first architecture.

Platform Overview & Core Features:

Algorithmic Social Matchmaking: Intelligently connects users by analyzing shared interests, localized proximity, conversational topics, and real-world social events. The system is designed to foster organic relationship-building by aligning individuals with highly relevant communities and potential friends.

AI-Powered Behavioral Recommendation Engine: Deeply integrates user analytics by capturing session heat maps, screen time metrics, and contextual content engagement. This continuous telemetry feeds an advanced AI recommendation system that dynamically surfaces new, high-affinity group chats and connections.

Encrypted, Real-Time Communication Infrastructure: Built on a robust technological foundation utilizing native WebRTC, Agora, and WebSockets. The platform guarantees ultra-low latency peer-to-peer communication and scalable group messaging, strictly governed by an end-to-end encrypted pipeline to ensure absolute user privacy.

Proactive Content Moderation: Employs a modern, sophisticated content moderation system that continuously monitors and sanitizes the ecosystem, maintaining a safe and healthy community environment without compromising the platform's core privacy principles.

Offline-First Mobile Optimization: Engineered specifically for the realities of mobile networking, the application employs advanced offline-first data synchronization. This ensures a seamless, uninterrupted user experience, allowing for data access and action queuing even during severe connectivity drops.
- **Role and Contribution:** Led architectural refactoring using Clean Architecture and DDD. Implemented advanced rate-limiting (debounce window) to balance REST API requests with local Hive DB calls. Consolidated multi-environment CI/CD pipelines and enhanced UI responsiveness.
- **Links:** 
  - Appstore: TBD
  - Playstore: TBD
  - Github: TBD
  - Company Website: TBD
- **Images:** 
  - Hero Sliders: 
    - /assets/lifebonder/lifebonder_mock1.jpeg
    - /assets/lifebonder/lifebonder_mock2.jpeg
  - Other Images: 
    - /assets/lifebonder/lifebonder_chat_groups.png
    - /assets/lifebonder/lifebonder_chat2.jpg
    - /assets/lifebonder/lifebonder_filter_location.png
    - /assets/lifebonder/lifebonder_full_chat.png
    - /assets/lifebonder/lifebonder_invite.png
    - /assets/lifebonder/lifebonder_login.png
- **Duration:** May 2025 – September 2025

---

### Gorofat App
- **Title:** Mushir App
- **Description:** A market place application selling partenered laweyer's legal services featuring real-time messaging (chat), geolocation, online payment, and secure Social Login integration.
- **About App**: Mushir App modernizes access to legal representation by establishing a curated, on-demand marketplace tailored exclusively for legal services. It removes the friction of traditional retainer models by providing a secure, structured ecosystem where clients can independently evaluate verified legal professionals, purchase transparently priced service packages, and manage legal consultations directly from their mobile devices.
- Platform Overview & Core Features:Verified Practitioner Profiles & Static Geolocation: Clients can explore comprehensive lawyer profiles detailing professional backgrounds, specialized practice areas, and static office locations via an integrated map system. This empowers informed decisions based on proximity and expertise while strictly preserving privacy by omitting active location tracking.
-  Structured Legal Consultations: The application facilitates flexible engagement models, allowing users to seamlessly schedule 1-on-1 legal consultancy calls or procure predetermined, fixed-scope legal service packages.- Custom Payment Engineering & Automated Reconciliation: To bypass the lack of a supported Android/iOS plugin for the payment provider, a custom Flutter payment package was engineered to integrate ClickPay.sa. 
This bespoke solution utilizes embedded WebViews, BLoC, and RxDart to securely process online transactions and seamlessly automate weekly financial payouts for partnered lawyers.  
- Advanced SSO & Deep Linking Architecture: Engineered with a robust Single Sign-On (SSO) authentication flow that is heavily enhanced by complex routing and deep linking capabilities. This ensures fluid user onboarding and highly targeted navigation directly to specific legal packages or active consultation environments.  Secure Real-Time Client-Lawyer Communication: Features an integrated, real-time chat infrastructure that enables clients and legal representatives to securely exchange information, share context, and coordinate details directly within the platform prior to or during their engagement.
- **Role and Contribution:** build an SSO based auth, that leverages deeplinking, advanced routing, and built a custom payment package using Flutter embedded webviews because of the abscence a supported android/ios plugin for Clickpay.sa
- **Links:** 
  - Appstore: TBD
  - Playstore: TBD
  - Github: TBD
  - Company Website: TBD
- **Images:** 
  - Hero Sliders:     
    - /assets/mushir/mushir_mock1.jpeg
    - /assets/mushir/mushir_mock2.jpeg
    - /assets/mushir/mushir_mock3.jpeg
  - Other Images: 
    - /assets/mushir/mushir_main.jpeg
    - /assets/mushir/mushir1.jpeg
    - /assets/mushir/mushir2.jpeg
    - /assets/mushir/mushir3.jpeg
- **Duration:** August 2024 – May 2025

---


### Electrical Concentrators Maintenance (Babel Group)
- **Title:** Electrical Concentrators Maintenance
- **Description:** A Flutter desktop business application dedicated to the maintenance of IoT electrical concentrators.
- **About App** GSPToolset: Enterprise Industrial IoT Maintenance Workstation
The Niche:
GSPToolset is a production-grade, Windows desktop workstation engineered specifically for electrical utility technicians and grid engineers. Distancing itself from conceptual or consumer-facing IoT dashboards, it functions as a highly technical Advanced Metering Infrastructure (AMI) diagnostic tool. It delivers high-density, real-time telemetry and granular protocol-level command execution, allowing professionals to securely connect to, monitor, and maintain complex networks of electrical concentrators and their associated smart meters.

Platform Overview & Core Features:

Multi-Session Desktop Architecture: Employs a sophisticated desktop layout featuring a central command hub that orchestrates multiple detached, floating concentrator windows. This allows technicians to maintain independent, simultaneous working sessions across different grid nodes.

Real-Time MQTT Telemetry: Consumes live streams of device data via an integrated MQTT broker. The interface displays real-time heartbeats, communication statistics, and device event logs with extreme precision and minimal latency.

Protocol-Level Command Panel: Features an engineering-focused command execution grid (e.g., Read Data, Time Sync, Execute Command, Reset) designed for direct device intervention and parameter configuration without unnecessary visual clutter.

High-Density Data Visualization: Utilizes high-performance data grids to render complex, dense tabular data for hundreds of connected meters, tracking highly specific electrical measurements like active power, current, and three-phase voltage.

Diagnostic & Export Modules: Aggregates device metadata, uptime, and communication errors into an organized diagnostic view, paired with robust extraction tools to parse and export tabular data into professional CSV and Excel reports.

- **Role and Contribution:** Native Multi-Window Engineering: Overhauled the multi-window desktop architecture by integrating and heavily customizing the flutter-windows-multi-window and window_manager packages. Developed custom C++ implementations to eliminate race conditions when interacting directly with native Windows APIs.

Inter-Window State Management: Architected a secure and efficient pipeline for sharing state seamlessly between the main command window and multiple detached concentrator sessions, supported by a custom-built command caching system.

Real-Time Pipeline Optimization: Structured and optimized the application's MQTT client architecture to handle continuous, heavy data streaming without bottlenecking the main UI thread.

Custom UI Rendering: Modified the underlying behavior of the Syncfusion DataGrid library to enable smooth row animations and transitions while processing rapid, real-time updates for complex meter data tables.

Data Parsing & Extraction: Engineered dynamic tabular parsing algorithms to reliably format and export massive live datasets into localized CSV and Excel files for offline utility analysis.
- **Links:** 
  - Appstore: N/A (Desktop)
  - Playstore: N/A (Desktop)
  - Github: TBD
  - Company Website: TBD
- **Images:** 
  - Hero Sliders:  /assets/gsp/Modernizing_design_2K_202608181337.jpeg
- **Duration:** May 2024 – August 2024

---

### Xcite Immo App
- **Title:** Xcite Immo App
- **Description:** A B2B real estate application tailored to the regulatory requirements of the German real estate industry, featuring full offline capabilities.
- **About App***
Xcite Immo is a multi-tenant SaaS ERP engineered specifically for the highly regulated real estate management sector. It transforms traditional, paper-heavy property management into a streamlined digital ecosystem. By pairing an uncompromising offline-first mobile architecture with an automated, legally binding contract generation engine, it empowers field agents to execute complex agreements seamlessly on-site, completely immune to network connectivity issues.

Platform Overview & Core Features:

Multi-Tenant SaaS Architecture: Functions as a scalable B2B platform, allowing independent real estate agencies to subscribe, onboard dedicated teams, and securely silo their client and contract data within a shared cloud ecosystem while maintaining strictly isolated local databases on their devices.

Automated Contract & Utility Engine: Eliminates physical paperwork by digitizing complex, multi-step workflows. Agents can provision rental agreements alongside localized utility setups (gas, electricity, internet) through strategic regional partnerships. Data is processed asynchronously via cron jobs to generate and distribute normalized, legally compliant PDF contracts via email.

Robust Offline-First Synchronization: Built to operate flawlessly in properties with zero connectivity (e.g., basements, remote sites). Agents can complete extensive forms and generate contracts entirely offline. Upon network restoration, the app's engine autonomously resolves conflicts and synchronizes local device data with the central Firebase Firestore database.

Advanced Support & Data Portability: Features specialized diagnostic and maintenance tools that allow agency teams to export local on-device databases and securely hand over session control to application maintainers for rapid troubleshooting and technical assistance.
- **Role and Contribution:**  Developed a custom end-to-end autocomplete engine and led the mobile team with weekly code reviews.Mobile Engineering Leadership: Directed the complete mobile engineering lifecycle, managing the mobile development team while coordinating with the broader web and backend teams. Enforced strict architectural standards and conducted rigorous weekly code reviews to maintain enterprise-grade quality.  Offline Synchronization Architecture: Architecturally redesigned and built the robust data synchronization engine bridging the isolated local SQLite/Hive databases with the multi-tenant Firebase Firestore backend, ensuring zero data loss during network transitions.  Complex Domain Modeling: Successfully solved intricate system architecture challenges to ensure absolute compliance with the strict regulatory frameworks and business processes of the German real estate industry.  Custom UI & Workflow Optimization: Designed and implemented a highly specialized, end-to-end custom autocomplete engine to drastically accelerate data entry and reduce cognitive load for agents navigating the platform's extensive multi-step forms.
- **Links:** 
  - Appstore: TBD
  - Playstore: TBD
  - Github: TBD
  - Company Website: TBD
- **Images:** 
  - Hero Sliders:
    - /assets/xcite/xcite_mock.jpeg
    - /assets/xcite/unnamed (6).webp
    - /assets/xcite/unnamed (7).webp
    - /assets/xcite/unnamed (8).webp
    - /assets/xcite/unnamed (9).webp
    - /assets/xcite/unnamed (10).webp
  - Other Images:
    - /assets/xcite/unnamed (2).webp
    - /assets/xcite/unnamed (3).webp
    - /assets/xcite/unnamed (4).webp
    - /assets/xcite/unnamed (5).webp
   
- **Duration:** October 2023 – May 2024

---

### TollHopper App
- **Title:** TollHopper App
- **Description:** A mobile application facilitating seamless European vignette sales with integrated secure payments.
- **About app**
TollHopper modernizes cross-border European travel by replacing the fragmented, confusing process of purchasing regional highway vignettes with a single, intelligent mobile utility. By combining interactive mapping with a smart distance and route calculator, the application autonomously determines the exact toll requirements for a user's journey and facilitates instant, secure digital procurement directly from their smartphone.

Platform Overview & Core Features:

Smart Routing & Toll Calculator: Integrates mapping and distance data to dynamically calculate journey requirements. It takes the guesswork out of cross-border road trips by pinpointing exactly which regional vignettes are needed based on the user's trajectory.

Dynamic Pricing Engine: Automatically aggregates and displays the specific, localized pricing for each required vignette based on the calculated routes and travel parameters.

Pan-European Vignette Marketplace: Provides a centralized, digital storefront for purchasing highway vignettes across multiple European jurisdictions, eliminating the friction of stopping at physical border kiosks.

Secure Omni-Channel Payments: Facilitates seamless, localized digital checkouts by offering multiple trusted payment methods, directly supporting Visa transactions via Stripe and integrated PayPal flows.
- **Role and Contribution:** Greenfield Mobile Engineering: Led the end-to-end development of the mobile application, architecting and building the entire TollHopper mobile platform from scratch.  Payment Systems Engineering: Spearheaded the complex integration and management of secure financial transaction pipelines, successfully embedding both Stripe and PayPal to handle seamless, compliant European vignette sales. 
- **Links:** 
  - Appstore: TBD
  - Playstore: TBD
  - Github: TBD
  - Company Website: TBD
- **Images:** 
  - Hero Sliders:
    - /assets/tollhopper/Tollhopper_mock1.jpeg
    - /assets/tollhopper/Tollhopper_mock2.jpeg
  - Other Images: 
    - /assets/tollhopper/image_original (23).jpeg
    - /assets/tollhopper/image_original.jpeg
    - /assets/tollhopper/image_original2.jpeg
    - /assets/tollhopper/image_original3.jpeg
- **Duration:** October 2023 – May 2024

---

### Gearni Marketplace
- **Title:** Gearni
- **Description:** A comprehensive e-commerce marketplace platform built on a modernized tech stack.
- **About App**
Gearni bridges the gap between auto parts suppliers and vehicle owners through a highly specialized, omni-channel B2B2C platform. By anchoring the discovery process around specifically registered vehicle models, it eliminates the traditional friction and uncertainty of part compatibility. Simultaneously, it digitizes the supplier side by providing dedicated enterprise tools to manage dynamic inventory and process custom quote requests in real time across both mobile and web interfaces.

Platform Overview & Core Features:

Omni-Channel Ecosystem: Operates via synchronized applications designed for unique user journeys—a consumer-facing retail mobile application, a dedicated "Shop" mobile app for vendors, and a comprehensive web platform for broader accessibility.

Vehicle-Centric Discovery (Consumer App): Allows customers to create profiles and register their specific car models, enabling a highly filtered, precise search engine to explore, verify, and order perfectly compatible auto parts.

Comprehensive Vendor Management (Shop App & Web): Empowers sellers to digitize their operations by registering part catalogs, managing complex inventory variations per vehicle model, and directly responding to incoming customer quote requests.

Seamless Identity & Secure Payments: Features integrated online payment gateways for frictionless checkouts, backed by an enterprise-grade Single Sign-On (SSO) identity management system utilizing Auth0 for secure, unified access across the web and mobile apps.

- **Role and Contribution:** Full-Stack & Technical Leadership: Directed the complete product lifecycle to entirely rebuild the Gearni marketplace. Built the web application from the ground up using AngularJS, concurrently developed the dual-sided mobile applications utilizing Flutter, and strictly led the backend engineering team utilizing NestJS.  Architecture & Quality Assurance: Introduced and rigorously applied Test-Driven Development (TDD) workflows, which drastically reduced system regressions. Mentored and trained the backend team in implementing Domain-Driven Design (DDD) architecture and automated testing.  Complex API Integrations & Identity Management: Architected advanced system integrations, directly connecting the application to the Zoho CRM API to trigger automated business workflows and data synchronization. Additionally, provided dedicated technical support to the WordPress development team to seamlessly implement the Auth0 SSO pipeline across the entire ecosystem.  DevOps & CI/CD Orchestration: Delivered specialized technical expertise to the DevOps teams regarding the nuances of the Flutter and web build processes, enabling the construction of highly optimized CI/CD pipelines utilizing Jenkins.
- **Links:** 
  - Appstore: TBD
  - Playstore: TBD
  - Github: TBD
  - Company Website: TBD
- **Images:** 
  - Hero Sliders: 
    - /assets/gearni/gearni_mock1.jpeg
    - /assets/gearni/gearni_mock2.jpeg
    - /assets/gearni/gearni_mock3.jpeg
  - Other Images: 
    - /assets/gearni/gearni1.jpeg
    - /assets/gearni/gearni2.jpeg
    - /assets/gearni/gearni3.jpeg
    - /assets/gearni/gearni4.jpeg
    - /assets/gearni/gearni5.jpeg
    - /assets/gearni/gearni6.jpeg
    - /assets/gearni/gearni7.jpeg
    - /assets/gearni/gearni8.jpeg
    - /assets/gearni/gearni9.jpeg
    - /assets/gearni/gearni10.jpeg
    - /assets/gearni/gearni11.jpeg
    - /assets/gearni/main.jpeg
- **Duration:** August 2022 – September 2023

---
============================= stop here =======================
### AI Recruitment System
- **Title:** AI Recruitment System
- **Description:** An advanced recruitment platform integrating a Resume Parser, a Job Matching algorithm, multi-agent AI, and a marketing prediction engine.
- **Role and Contribution:** Developed the full-stack frontend in Flutter (structured as a monorepo via Melos) and built a self-hosted Appwrite backend powered by Python and Dart microservices.
- **Links:** 
  - Appstore: TBD
  - Playstore: TBD
  - Github: TBD
  - Company Website: TBD

- **Duration:** Ongoing (Private Project)

---

### Responsive Flutter Dashboard
- **Title:** Responsive Flutter Dashboard
- **Description:** An open-source admin interface showcasing a fluid and adaptive multi-platform architecture.
- **Role and Contribution:** Designed and developed the UI architecture, optimizing it for diverse screen sizes.
- **Links:** 
  - Appstore: N/A
  - Playstore: N/A
  - Github: https://github.com/TBD
  - Company Website: N/A
- **Images:** 
  - Hero Sliders: /assets/images/projects/flutter_dashboard/hero.jpg
  - Other Images: []
- **Duration:** N/A

---

### TSP AI Solver
- **Title:** TSP AI Solver
- **Description:** An open-source application utilizing Reinforcement Learning to solve complex optimization problems (Traveling Salesperson Problem).
- **Role and Contribution:** Applied Reinforcement Learning (RL) coupled with Domain-Driven Design (DDD) architecture to model and solve the routing challenges.
- **Links:** 
  - Appstore: N/A
  - Playstore: N/A
  - Github: https://github.com/TBD
  - Company Website: N/A
- **Images:** 
  - Hero Sliders: /assets/images/projects/tsp_solver/hero.jpg
  - Other Images: []
- **Duration:** N/A