# Math Challenge Lab (Classroom Webapp)

Interactive mathematics challenge activities for **Primary**, **Secondary**, and **High School** classroom use — with **distinct UI/UX “worlds” per level**.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## What’s inside

- **Primary (Candy Lab)**: big controls + fast confidence builders
- **Secondary (Neon Arcade)**: faster pace + “gamey” visuals
- **High School (Studio Mode)**: calm premium layout for deeper thinking

Activities (each works for all levels with different question generators):

- **Quickfire Sprint** (`quickfire`): timed input answers + streak bonus
- **One Is Correct** (`pickone`): multiple choice card picking
- **Match Pairs** (`matchpairs`): connect left ↔ right concepts

## Extend / edit questions

All question generation is in:

- `src/quiz/generate.ts`

Add new activities in:

- `src/quiz/activities.ts`
- `src/ui/*`

