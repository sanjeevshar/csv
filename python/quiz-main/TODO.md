# TODO

## Step 1: Implement CSV runtime loader
- Create `source-code/src/data/loadCsv.ts` to fetch `./data/<subject>.csv` and parse into `Question[]`.

## Step 2: Update `questions.ts`
- Remove imports from `./physics`, `./gk`, etc.
- Export `QUESTIONS_BY_SUBJECT` as a function or lazy async loader result.
- Update consumers (likely `KBCQuiz.tsx`) to load questions asynchronously.

## Step 3: Expand CSVs to 10,000
- For each subject CSV in `source-code/src/data/*.csv`, pad/duplicate rows to exactly 10,000.
- Ensure `Index` is sequential 1..10000.

## Step 4: Delete subject TS files
- Delete `source-code/src/data/{physics,math,gk,hindi,history,geography,science,computer}.ts`.

## Step 5: Verify
- Build/run and confirm quiz loads 10,000 questions per subject.
