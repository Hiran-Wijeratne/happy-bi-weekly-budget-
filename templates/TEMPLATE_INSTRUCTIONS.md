# Biweekly Budget Template — Build Instructions
# (Open in Excel or Google Sheets and save as .xlsx)

## Tab structure (6 tabs total):

### Tab 1: START HERE (instructions tab)
Color: Green
Content:
  Row 1: "PAYCHECK BUDGET TEMPLATE" (merged A1:F1, large bold font, brand blue fill)
  Row 3: "HOW TO USE THIS TEMPLATE"
  Row 5: "1. Fill in your PAY PERIOD DATES on each paycheck tab"
  Row 6: "2. Enter your INCOME at the top of each paycheck tab"
  Row 7: "3. Enter BUDGETED amounts in column C (how much you PLAN to spend)"
  Row 8: "4. Enter ACTUAL amounts in column D as you spend (or after period ends)"
  Row 9: "5. Column E (DIFFERENCE) calculates automatically — green means under, red means over"
  Row 11: "TIPS"
  Row 12: "- You get 26 paychecks per year (not 24). Two months will have 3 paychecks!"
  Row 13: "- The 3RD PAYCHECK tab is for those bonus months — use it for debt payoff or savings"
  Row 14: "- Partner income? Add it to the income section on each tab"
  Row 15: "- Debt and Savings tabs help you track progress over time"
  Row 17: "CATEGORIES EXPLAINED"
  Row 18: Housing — Rent/mortgage, HOA, renter's insurance
  Row 19: Transportation — Car payment, gas, insurance, parking, public transit
  Row 20: Groceries — Food bought at grocery stores/markets (not restaurants)
  Row 21: Utilities — Electric, water, gas, trash, internet, phone
  Row 22: Healthcare — Doctor visits, prescriptions, copays, gym
  Row 23: Insurance — Life, disability, pet, any not in other categories
  Row 24: Dining Out — Restaurants, takeout, coffee shops, delivery apps
  Row 25: Entertainment — Streaming, events, hobbies, movies
  Row 26: Personal Care — Hair, nails, toiletries, skincare
  Row 27: Clothing — All clothing and accessories
  Row 28: Subscriptions — Software, apps, membership fees
  Row 29: Miscellaneous — Gifts, unexpected expenses, anything else

### Tab 2: PAYCHECK 1 (first period of month)
### Tab 3: PAYCHECK 2 (second period of month)
### Tab 4: 3RD PAYCHECK BONUS (for 3-paycheck months)

Layout for each paycheck tab:
  Row 1: "PAYCHECK BUDGET" (merged A1:E1, bold)
  Row 2: "Pay Period:" | [start date input] | "to" | [end date input]
  Row 3: (blank separator)
  Row 4: "INCOME" (bold header)
  Row 5: "Primary income" | | | [$ amount input]
  Row 6: "Partner income (optional)" | | | [$ amount input]
  Row 7: "TOTAL INCOME" | | | =SUM(D5:D6) (bold, green fill)
  Row 8: (blank separator)
  Row 9: Headers: CATEGORY | ICON | BUDGETED | ACTUAL | DIFFERENCE | NOTES
  Rows 10-21: One row per category:
    10: Housing       | 🏠 | [input] | [input] | =C10-D10
    11: Transportation| 🚗 | [input] | [input] | =C11-D11
    12: Groceries     | 🛒 | [input] | [input] | =C12-D12
    13: Utilities     | 💡 | [input] | [input] | =C13-D13
    14: Healthcare    | 🏥 | [input] | [input] | =C14-D14
    15: Insurance     | 🛡️ | [input] | [input] | =C15-D15
    16: Dining Out    | 🍽️ | [input] | [input] | =C16-D16
    17: Entertainment | 🎬 | [input] | [input] | =C17-D17
    18: Personal Care | 💆 | [input] | [input] | =C18-D18
    19: Clothing      | 👕 | [input] | [input] | =C19-D19
    20: Subscriptions | 📱 | [input] | [input] | =C20-D20
    21: Miscellaneous | 📦 | [input] | [input] | =C21-D21
    22: [custom row]  |    | [input] | [input] | =C22-D22
    23: [custom row]  |    | [input] | [input] | =C23-D23
  Row 24: (blank)
  Row 25: "TOTALS" | | =SUM(C10:C23) | =SUM(D10:D23) | =C25-D25
  Row 26: "INCOME REMAINING" | | | | =D7-D25 (bold, green if positive, red if negative)

  Formatting rules:
  - Difference column (E): Conditional formatting — green fill if >=0, red fill if <0
  - Income remaining (E26): Bold, green fill if >=0, red fill if <0
  - Budgeted and Actual columns: currency format ($#,##0.00)
  - Lock all formula cells (E column, totals row, income total)
  - Leave input cells unlocked (C column, D column, D5:D6, date cells)

### Tab 5: DEBT TRACKER
  Row 1: "DEBT TRACKER" (merged, bold, header)
  Row 2: "Track your debt payoff progress. Log a payment each paycheck."
  Row 4: Headers: DEBT NAME | TYPE | ORIGINAL BALANCE | CURRENT BALANCE | APR % | MIN PAYMENT | PAID OFF %
  Rows 5-14: 10 debt rows, with:
    - % Paid formula: =(C-D)/C (shows progress toward payoff)
    - Conditional format: green when % >= 100
  Row 16: "PAYMENT LOG"
  Row 17: Headers: DATE | DEBT NAME | PAYCHECK # | PAYMENT AMOUNT | NEW BALANCE
  Rows 18-47: 30 payment log rows (user fills in manually)

### Tab 6: SAVINGS GOALS
  Row 1: "SAVINGS GOALS" (merged, bold, header)
  Row 3: Headers: GOAL | ICON | TARGET AMOUNT | CURRENT AMOUNT | REMAINING | % COMPLETE | TARGET DATE
  Rows 4-13: 10 goal rows, with:
    - Remaining: =C-D
    - % Complete: =D/C (formatted as percentage)
    - Conditional format: green fill on % Complete when >=100%
  Row 15: "CONTRIBUTION LOG"
  Row 16: Headers: DATE | GOAL | PAYCHECK # | CONTRIBUTION | RUNNING TOTAL
  Rows 17-46: 30 contribution log rows

## Formatting standards:
- Font: Calibri 11pt body, 12pt headers
- Header rows: Bold, brand blue fill (#0284c7), white text
- Alternating row colors: white / light blue (#f0f9ff)
- All currency cells: format as $#,##0.00
- Date cells: format as MM/DD/YYYY
- Print area: A1:F30 per sheet
- Freeze panes: Row 9 on paycheck tabs (keeps headers visible while scrolling)
- Sheet tab colors: Green (instructions), Blue (P1), Blue (P2), Purple (3rd), Red (debts), Teal (savings)
