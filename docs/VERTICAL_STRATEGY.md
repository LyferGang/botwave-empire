# Botwave Vertical Testing Strategy
**7 Bots × 7 Industries = Market Validation**

---

## OVERVIEW

Each of your 7 Telegram bots will be repurposed to test Botwave in a different industry vertical. This allows you to:
- Test AI dispatch across different business types
- Gather industry-specific pricing data
- Build vertical-specific case studies
- Find your best product-market fit

---

## VERTICAL ASSIGNMENTS

| Bot | Industry | Use Case | Target Customer |
|-----|----------|----------|-----------------|
| **Boti1904** | Plumbing | Emergency dispatch | Plumbers, HVAC |
| **PaperChaser** | Real Estate | Lead qualification | Realtors, property managers |
| **Trades** | Home Services | Multi-trade dispatch | Electricians, locksmiths |
| **Design** | E-commerce | Customer support | Online stores, Shopify |
| **Captain** | Legal | Intake & scheduling | Law firms, paralegals |
| **Business** | Medical/Dental | Patient scheduling | Dental practices, clinics |
| **Mamma** | Restaurants | Reservation management | Restaurants, catering |

---

## VERTICAL 1: Boti1904 → Plumbing (Existing)

### Purpose
24/7 emergency plumbing dispatch

### Commands
```
/start - Activate emergency service
/emergency - Report urgent issue
/schedule - Book non-emergency
/track - Track dispatched plumber
/bill - Get invoice
```

### Urgency Levels
| Level | Keywords | Response Time | Price |
|-------|----------|---------------|-------|
| Critical | burst, flooding, gas leak | 15 min | $450 |
| High | overflow, no water, sewage | 30 min | $350 |
| Medium | leak, drip, running | 4 hrs | $200 |
| Low | install, repair, maintenance | 24 hrs | $150 |

### Test Metrics
- Calls captured after-hours
- Jobs dispatched
- Revenue from captured calls
- Customer satisfaction

---

## VERTICAL 2: PaperChaser → Real Estate

### Purpose
Lead qualification & property inquiry handling

### Commands
```
/start - View listings
/inquire <property_id> - Schedule showing
/qualify - Buyer pre-qualification
/mortgage - Calculate payments
/offer - Submit offer
/status - Offer status
```

### Lead Qualification Flow
```
1. Budget range?
2. Pre-approved? (Y/N)
3. Timeline to buy?
4. Must-have features?
5. Contact info?
→ Score: Hot/Warm/Cold
→ Hot: Agent calls within 1 hour
→ Warm: Email nurture sequence
→ Cold: Monthly newsletter
```

### Test Metrics
- Leads qualified
- Showings scheduled
- Conversion rate to offers
- Agent time saved

---

## VERTICAL 3: Trades → Home Services (Multi-Trade)

### Purpose
Dispatch for electricians, locksmiths, garage door, appliance repair

### Commands
```
/start - Service selection
/electric - Electrical service
/locksmith - Lock/keys
/garage - Garage door
/appliance - Appliance repair
/urgent - Emergency service
```

### Service Categories
| Category | Services | Avg Price | Urgency |
|----------|----------|-----------|---------|
| Electrical | Panel, wiring, outlets | $250-500 | High |
| Locksmith | Lockout, rekey, install | $150-300 | Critical |
| Garage Door | Broken spring, opener | $200-400 | Medium |
| Appliance | Repair, install | $150-350 | Medium |

### Test Metrics
- Trades dispatched
- Cross-sell rate
- Technician utilization
- Average job value

---

## VERTICAL 4: Design → E-commerce

### Purpose
Customer support + order management for online stores

### Commands
```
/start - Help menu
/order <id> - Track order
/return - Initiate return
/exchange - Exchange item
/support - Human agent
/discount - Promo codes
```

### Support Flows
```
Order Status:
1. Get order ID
2. Fetch from Shopify/WooCommerce
3. Return tracking + ETA
4. Offer discount if delayed

Returns:
1. Reason for return?
2. Generate return label
3. Refund processed in 5 days
4. Offer 10% off next order

Product Questions:
1. AI answers from product DB
2. Escalate to human if unsure
```

### Test Metrics
- Tickets resolved automatically
- Human escalation rate
- Customer satisfaction (CSAT)
- Order recovery rate

---

## VERTICAL 5: Captain → Legal Services

### Purpose
Client intake & case scheduling for law firms

### Commands
```
/start - Practice areas
/consult - Free consultation
/case - Case status
/docs - Upload documents
/bill - Invoice payment
```

### Practice Areas
| Area | Intake Questions | Urgency |
|------|------------------|---------|
| Personal Injury | Accident date, injuries, insurance | High |
| Family Law | Children, assets, urgency | Medium |
| Criminal | Charges, court date, bail | Critical |
| Estate | Assets, beneficiaries, timeline | Low |

### Intake Flow
```
1. Practice area selection
2. Incident details
3. Contact information
4. Conflict check (database search)
5. Schedule consultation
6. Send intake forms via email
```

### Test Metrics
- Intakes completed
- Consultations booked
- Cases opened
- Client acquisition cost

---

## VERTICAL 6: Business → Medical/Dental

### Purpose
Patient scheduling & appointment management

### Commands
```
/start - Services menu
/appointment - Book visit
/reschedule - Change appointment
/reminder - Set reminder
/records - Request records
/insurance - Verify coverage
```

### Appointment Types
| Type | Duration | Price | Insurance |
|------|----------|-------|-----------|
| Cleaning | 45 min | $120 | Covered |
| Filling | 60 min | $250 | Covered |
| Crown | 90 min | $800 | Partial |
| Emergency | 30 min | $150 | Varies |

### Scheduling Flow
```
1. Service selection
2. Insurance verification
3. Available slots (next 7 days)
4. Patient info + confirmation
5. SMS reminder 24hrs before
6. Check-in link day-of
```

### Test Metrics
- Appointments booked
- No-show reduction
- Insurance verified
- Patient satisfaction

---

## VERTICAL 7: Mamma → Restaurants

### Purpose
Reservation management & waitlist

### Commands
```
/start - View menu
/reserve <date> <time> <party>
/waitlist - Join waitlist
/order - Takeout order
/call - Call restaurant
```

### Reservation Flow
```
1. Date selection
2. Time selection
3. Party size
4. Contact info
5. Special requests (allergies, etc.)
6. Confirmation SMS
7. Reminder 2 hours before
```

### Waitlist Flow
```
1. Party size
2. Phone number
3. ETA: 20-30 min
4. SMS when table ready
5. Auto-remove after 15 min no-show
```

### Test Metrics
- Reservations booked
- Waitlist conversion
- Table turnover rate
- No-show rate

---

## TESTING ROADMAP

### Week 1-2: Plumbing (Boti1904)
- Deploy at dad's business
- Capture baseline metrics
- Refine urgency classification

### Week 3-4: Real Estate (PaperChaser)
- Partner with 1 realtor
- Test lead qualification
- Measure showing conversion

### Week 5-6: Home Services (Trades)
- Add electrician partner
- Test multi-trade routing
- Measure cross-sell rate

### Week 7-8: E-commerce (Design)
- Shopify store pilot
- Test auto-support
- Measure deflection rate

### Week 9-10: Legal (Captain)
- Law firm pilot
- Test intake flow
- Measure consultation booking

### Week 11-12: Medical (Business)
- Dental practice pilot
- Test scheduling
- Measure no-show reduction

### Week 13-14: Restaurants (Mamma)
- Restaurant pilot
- Test reservations
- Measure fill rate

---

## PRICING BY VERTICAL

| Vertical | Solo | Team | Enterprise |
|----------|------|------|------------|
| Plumbing | $299 | $399 | $499 |
| Real Estate | $399 | $599 | $799 |
| Home Services | $299 | $399 | $499 |
| E-commerce | $199 | $399 | $699 |
| Legal | $499 | $799 | $1,299 |
| Medical | $599 | $899 | $1,499 |
| Restaurants | $199 | $399 | $599 |

**Why different pricing?**
- Legal/Medical: Higher ACV, compliance needs
- Real Estate: Higher lead value
- E-commerce: Volume-based (ticket count)
- Restaurants: Lower margin industry

---

## SUCCESS CRITERIA

A vertical is "validated" when:
1. ✅ 3+ paying customers
2. ✅ $10k+ MRR in vertical
3. ✅ 90%+ customer retention (90 days)
4. ✅ Case study published
5. ✅ Referral rate >20%

---

## NEXT STEPS

1. Pick **one vertical** to start (recommend Plumbing - you have dad's business)
2. Customize bot commands for that vertical
3. Deploy & measure for 2 weeks
4. Iterate based on feedback
5. Move to next vertical

---

**SCRIPT KEEPER v2026.4**
*Test one vertical at a time. Win there, then expand.*
