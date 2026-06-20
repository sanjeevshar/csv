
import random
import time
import os
import sys
import utils # Ours

# Use the supplied questions file from the command line, otherwise default to qbank1.csv
questions_file = sys.argv[1] if len(sys.argv) > 1 else 'qbank1.csv'


def main():
    count = 0
    score = 0
    attempted = 0
    question_bank = utils.read_questions(questions_file)
    total_questions = len(question_bank) - 1  # Exclude header row
    ask_count = get_question_count(total_questions)
    #ask_count = 3
    #Start timer
    start_time = time.time()
    while count < ask_count:
        #pick a random question from question bank
        num = random.randint(1,(total_questions))
        #print(f"Selected question index: {num}")
        print("\n")
        #Question is a random question for list of questions

        question = (question_bank[num])
        #Call function to display question
        utils.ask_question(question)

        answer = utils.get_answer(question)
        if answer == 's':
            print("यह प्रश्न छोड़ रहे हैं।")
            continue
        elif answer == 'x':
            #utils.finish_quiz(attempted,score, start_time)
            count = ask_count   # This is a hack to exit while loop
            break
        # Check the answer
        elif answer == question[2]:
            score += 1
            attempted += 1
            print("\nशाबाश !!! सही उत्तर!")

        else:
            print(f"\nगलत उत्तर! सही उत्तर है: {question[2]}")
            attempted += 1
        count += 1
        print("==============================================\n")
        resp = input("अगले प्रश्न पर जाने के लिए Enter दबाएं या बाहर निकलने के लिए x <Enter> दबाएं: ")
        if resp == 'x':
            #utils.finish_quiz(attempted,score, start_time)
            break
        print(chr(27) + "[2J")

    utils.finish_quiz(attempted,score, start_time)
        

# End of the quiz

######################################################################################

def get_question_count(total_questions):
    count = 0
    while (count < 1 ) or (count > total_questions):
        count = input(f"आप आज कितने प्रश्न हल करना चाहते हैं (अधिकतम: {total_questions}): ")
        count = int(count)
    return(count)

######################################################################################

if __name__=="__main__":
    main()



