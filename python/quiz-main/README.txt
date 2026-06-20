Quiz Application Usage
=====================

This repository contains a simple Python quiz program. The main script is `quiz.py`.

Requirements
------------
- Python 3.x installed
- `utils.py` present in the same directory
- A quiz question CSV file such as `qbank1.csv`

Running the quiz
----------------
1. Open a terminal in the repository folder:
   `c:\Users\home\Documents\GitHub\quiz`
2. Run the quiz script with the default question file:
   `python quiz.py`
3. Or run with a custom CSV file:
   `python quiz.py your_questions.csv`

What happens when you run it
----------------------------
- `quiz.py` loads questions from `qbank1.csv` by default.
- If a filename is provided on the command line, it loads questions from that file instead.
- You are prompted to enter how many questions you want to attempt.
- Questions are selected randomly from the question bank.
- For each question, you can:
  - enter the answer
  - enter `s` to skip the current question
  - enter `x` to exit the quiz early
- After each question, press Enter to continue or enter `x` to stop.
- At the end, the program prints your score and timing information.

Customizing the question file
-----------------------------
- You can use a different question CSV file by passing it as an argument to `quiz.py`.
- The CSV should follow the format expected by `utils.read_questions`.

Notes
-----
- `quiz.py` uses helper functions from `utils.py` to ask questions, capture answers, and finish the quiz.
- The script is designed for command-line use and is not a graphical application.
