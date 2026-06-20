#Collections of functions used by quiz program
import csv
import time
import sys
import os
#from playsound import playsound

# Function to read marks from a file
def read_questions(file_name):
    q_data = []
    try:
        with open(file_name, 'r') as file:
            csv_data = csv.reader(file)
            for row in csv_data:
                q_data.append(row)
        return q_data
    except FileNotFoundError:
        print(f"प्रश्न फ़ाइल नहीं मिली। कृपया जांचें कि फ़ाइल {file_name} मौजूद है या नहीं।")
        #return []
        exit()

def ask_question(question_line):
        #Field [1] is the question itself
        print(question_line[1],"\n")
        #Print choices a to d for the question
        ch = 'a'
        for choice in question_line[3:7]:
            print(f"\t{ch})  {choice}")
            ch = chr(ord(ch) + 1)

def get_answer(question):
    valid_ans = False
    while valid_ans == False:    
        print("==============================================")
        answer = input("अपना उत्तर दर्ज करें ( a - d  s: छोड़ें, h: हिंदी अनुवाद,  x: बाहर): ")
        answer = answer.lower()

        if answer in ['a', 'b', 'c', 'd', 's', 'x']:
            valid_ans = True
            return answer
        elif answer in ['h']:
            #play music
            clip = "./audio/" + question[7]
            play_audio(clip)
        else:
            print("अमान्य विकल्प। कृपया एक वैध विकल्प दर्ज करें।")
    print(f"उत्तर लौटा रहे हैं: {answer}")

def play_audio(clip):
    if  os.path.isfile(clip):
        print("प्रश्न ऑडियो चला रहे हैं...")
        #playsound(clip)
    else:
        print(f"क्षमा करें! प्रश्न के लिए ऑडियो फ़ाइल उपलब्ध नहीं है")
        #print(f"Audio file {clip} for question not found")
    return()


def finish_quiz(attempted,score, start_time):
    # End timer
    end_time = time.time()
    print("==============================================\n")
    print("क्विज़ पूर्ण हो गया। भाग लेने के लिए धन्यवाद!\n")
    print(f"आपका स्कोर {attempted} में से {score} है\n")
    print(f"क्विज़ में लिया गया कुल समय: {int(end_time - start_time)} सेकंड\n")
    print("क्विज़ से बाहर निकल रहे हैं। अलविदा!")
    sys.exit(0)