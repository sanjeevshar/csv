import csv
import random
from typing import List, Dict

# Question templates for different subjects
QUESTION_TEMPLATES = {
    'hindi': [
        ('{author} ने कौन सी रचना लिखी?', 'a', '{correct_work}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('हिंदी साहित्य में {work} के लेखक कौन हैं?', 'b', '{wrong1}', '{correct_author}', '{wrong2}', '{wrong3}'),
        ('{term} का अर्थ क्या है?', 'c', '{wrong1}', '{wrong2}', '{correct_meaning}', '{wrong3}'),
        ('{literary_period} काल किस शताब्दी में था?', 'a', '{correct_century}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('{poet} की प्रमुख कृति कौन सी है?', 'd', '{wrong1}', '{wrong2}', '{wrong3}', '{correct_work}'),
    ],
    'geography': [
        ('{country} की राजधानी क्या है?', 'b', '{wrong1}', '{correct_capital}', '{wrong2}', '{wrong3}'),
        ('{river} नदी का उद्गम कहाँ से होता है?', 'a', '{correct_source}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('{mountain} पर्वत की ऊंचाई कितनी है?', 'c', '{wrong1}', '{wrong2}', '{correct_height}', '{wrong3}'),
        ('{state} किस देश में स्थित है?', 'd', '{wrong1}', '{wrong2}', '{wrong3}', '{correct_country}'),
        ('{desert} मरुस्थल का क्षेत्रफल कितना है?', 'a', '{correct_area}', '{wrong1}', '{wrong2}', '{wrong3}'),
    ],
    'gk': [
        ('{event} कब हुआ था?', 'b', '{wrong1}', '{correct_year}', '{wrong2}', '{wrong3}'),
        ('{person} का जन्म कब हुआ था?', 'a', '{correct_year}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('{organization} की स्थापना किसने की?', 'c', '{wrong1}', '{wrong2}', '{correct_founder}', '{wrong3}'),
        ('{award} पुरस्कार किस वर्ष शुरू हुआ?', 'd', '{wrong1}', '{wrong2}', '{wrong3}', '{correct_year}'),
        ('{country} की मुद्रा क्या है?', 'a', '{correct_currency}', '{wrong1}', '{wrong2}', '{wrong3}'),
    ],
    'math': [
        ('{number} का वर्ग क्या है?', 'b', '{wrong1}', '{correct_square}', '{wrong2}', '{wrong3}'),
        ('{number} का वर्गमूल क्या है?', 'a', '{correct_sqrt}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('{number} का {percent}% क्या है?', 'c', '{wrong1}', '{wrong2}', '{correct_percent}', '{wrong3}'),
        ('{number1} और {number2} का योग क्या है?', 'd', '{wrong1}', '{wrong2}', '{wrong3}', '{correct_sum}'),
        ('{number} का गुणनखंड क्या है?', 'a', '{correct_factor}', '{wrong1}', '{wrong2}', '{wrong3}'),
    ],
    'history': [
        ('{war} युद्ध कब हुआ था?', 'b', '{wrong1}', '{correct_year}', '{wrong2}', '{wrong3}'),
        ('{emperor} का शासनकाल कब था?', 'a', '{correct_period}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('{movement} आंदोलन किसने शुरू किया?', 'c', '{wrong1}', '{wrong2}', '{correct_leader}', '{wrong3}'),
        ('{treaty} संधि किस वर्ष हुई?', 'd', '{wrong1}', '{wrong2}', '{wrong3}', '{correct_year}'),
        ('{dynasty} वंश के संस्थापक कौन थे?', 'a', '{correct_founder}', '{wrong1}', '{wrong2}', '{wrong3}'),
    ],
    'physics': [
        ('{quantity} की SI इकाई क्या है?', 'b', '{wrong1}', '{correct_unit}', '{wrong2}', '{wrong3}'),
        ('{law} का सूत्र क्या है?', 'a', '{correct_formula}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('{phenomenon} किस कारण से होता है?', 'c', '{wrong1}', '{wrong2}', '{correct_cause}', '{wrong3}'),
        ('{scientist} ने क्या खोज किया?', 'd', '{wrong1}', '{wrong2}', '{wrong3}', '{correct_discovery}'),
        ('{constant} का मान क्या है?', 'a', '{correct_value}', '{wrong1}', '{wrong2}', '{wrong3}'),
    ],
    'science': [
        ('{element} का रासायनिक प्रतीक क्या है?', 'b', '{wrong1}', '{correct_symbol}', '{wrong2}', '{wrong3}'),
        ('{organ} का कार्य क्या है?', 'a', '{correct_function}', '{wrong1}', '{wrong2}', '{wrong3}'),
        ('{disease} का कारण क्या है?', 'c', '{wrong1}', '{wrong2}', '{correct_cause}', '{wrong3}'),
        ('{process} किसमें होता है?', 'd', '{wrong1}', '{wrong2}', '{wrong3}', '{correct_location}'),
        ('{vitamin} की कमी से क्या होता है?', 'a', '{correct_deficiency}', '{wrong1}', '{wrong2}', '{wrong3}'),
    ]
}

# Data for generating questions
DATA = {
    'hindi': {
        'authors': ['तुलसीदास', 'सूरदास', 'कबीरदास', 'रसखान', 'मीराबाई', 'बिहारीलाल', 'भारतेंदु हरिश्चंद्र'],
        'works': ['रामचरितमानस', 'सूरसागर', 'बीजक', 'प्रेमरस', 'पदावली', 'सतसई', 'अंधेर नगरी'],
        'terms': ['अलंकार', 'रस', 'छंद', 'रीति', 'ध्वनि', 'अर्थ'],
        'periods': ['आदिकाल', 'भक्तिकाल', 'रीतिकाल', 'आधुनिक काल', 'छायावाद'],
        'centuries': ['10वीं शताब्दी', '11वीं शताब्दी', '12वीं शताब्दी', '13वीं शताब्दी', '14वीं शताब्दी'],
    },
    'geography': {
        'countries': ['भारत', 'चीन', 'अमेरिका', 'रूस', 'ब्राजील', 'ऑस्ट्रेलिया', 'कनाडा'],
        'capitals': ['नई दिल्ली', 'बीजिंग', 'वाशिंगटन डी.सी.', 'मॉस्को', 'ब्रासीलिया', 'कैनबेरा', 'ओटावा'],
        'rivers': ['गंगा', 'यमुना', 'ब्रह्मपुत्र', 'नर्मदा', 'गोदावरी', 'कृष्णा', 'कावेरी'],
        'sources': ['गंगोत्री ग्लेशियर', 'यमुनोत्री ग्लेशियर', 'मानसरोवर', 'अमरकंटक', 'त्र्यंबकेश्वर'],
        'mountains': ['माउंट एवरेस्ट', 'K2', 'कंचनजंगा', 'मकालू', 'नंगा पर्वत'],
        'heights': ['8848 मीटर', '8611 मीटर', '8586 मीटर', '8485 मीटर', '8126 मीटर'],
    },
    'gk': {
        'events': ['भारत की आजादी', 'फ्रांसीसी क्रांति', 'रूसी क्रांति', 'अमेरिकी क्रांति'],
        'persons': ['महात्मा गांधी', 'नेहरू', 'सुभाष चंद्र बोस', 'भगत सिंह'],
        'organizations': ['संयुक्त राष्ट्र', 'WHO', 'UNESCO', 'IMF'],
        'awards': ['नोबेल पुरस्कार', 'भारत रत्न', 'पद्म श्री', 'पुलित्जर पुरस्कार'],
    },
    'math': {
        'numbers': list(range(1, 101)),
    },
    'history': {
        'wars': ['पानीपत की पहली लड़ाई', 'पानीपत की दूसरी लड़ाई', 'प्लासी का युद्ध', 'बक्सर का युद्ध'],
        'years': ['1526', '1556', '1757', '1764', '1857', '1947'],
    },
    'physics': {
        'quantities': ['बल', 'ऊर्जा', 'शक्ति', 'दाब', 'वेग'],
        'units': ['न्यूटन', 'जूल', 'वाट', 'पास्कल', 'मीटर/सेकंड'],
    },
    'science': {
        'elements': ['हाइड्रोजन', 'ऑक्सीजन', 'कार्बन', 'नाइट्रोजन', 'सोडियम'],
        'symbols': ['H', 'O', 'C', 'N', 'Na'],
    }
}

def generate_wrong_answers(correct_answer, subject):
    """Generate wrong answers based on the correct answer"""
    wrong_answers = []
    
    if isinstance(correct_answer, (int, float)):
        # For numeric answers, add/subtract small values
        wrong_answers.append(correct_answer + random.randint(1, 10))
        wrong_answers.append(correct_answer - random.randint(1, 10))
        wrong_answers.append(correct_answer + random.randint(10, 20))
    else:
        # For text answers, use generic wrong answers
        generic_wrongs = ['उपरोक्त में से कोई नहीं', 'अज्ञात', 'अन्य', 'इनमें से एक']
        wrong_answers = generic_wrongs[:3]
    
    return wrong_answers

def generate_question(subject, index):
    """Generate a single question for a given subject"""
    if subject not in QUESTION_TEMPLATES:
        return None
    
    templates = QUESTION_TEMPLATES[subject]
    template = random.choice(templates)
    
    # Generate question based on template
    question_text = template[0]
    answer = template[1]
    
    # Fill in template variables
    if subject == 'math':
        num = random.randint(1, 100)
        question_text = question_text.format(
            number=num,
            number1=random.randint(1, 50),
            number2=random.randint(1, 50),
            percent=random.randint(1, 100)
        )
        
        # Calculate correct answer
        if 'वर्ग' in question_text:
            correct = str(num * num)
        elif 'वर्गमूल' in question_text:
            correct = str(int(num ** 0.5))
        elif 'योग' in question_text:
            correct = str(num + random.randint(1, 50))
        else:
            correct = str(num)
        
        wrong = generate_wrong_answers(int(correct), subject)
        a, b, c, d = wrong[0], wrong[1], wrong[2], correct
        
        # Set correct answer position
        positions = ['a', 'b', 'c', 'd']
        answer = random.choice(positions)
        
    else:
        # For other subjects, use placeholder data
        question_text = question_text.replace('{', '').replace('}', '')
        correct = 'सही उत्तर'
        wrong = generate_wrong_answers(correct, subject)
        a, b, c, d = wrong[0], wrong[1], wrong[2], correct
        answer = random.choice(['a', 'b', 'c', 'd'])
    
    # Ensure all values are strings and not None
    return {
        'index': str(index),
        'subject': subject,
        'question': str(question_text),
        'answer': str(answer),
        'a': str(a),
        'b': str(b),
        'c': str(c),
        'd': str(d)
    }

def expand_csv_file(input_file, output_file, target_count):
    """Expand a CSV file to reach target count"""
    questions = []
    
    # Read existing questions
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                questions.append(row)
    except FileNotFoundError:
        # Create header if file doesn't exist
        questions = []
    
    # Determine subject from filename
    subject = input_file.split('/')[-1].replace('.csv', '')
    
    # Generate additional questions
    current_count = len(questions)
    needed = target_count - current_count
    
    print(f"Expanding {subject}: {current_count} -> {target_count} (need {needed} more)")
    
    for i in range(needed):
        new_question = generate_question(subject, current_count + i + 1)
        if new_question:
            questions.append(new_question)
        
        # Progress indicator
        if (i + 1) % 1000 == 0:
            print(f"  Generated {i + 1}/{needed} questions...")
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['index', 'subject', 'question', 'answer', 'a', 'b', 'c', 'd']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(questions)
    
    print(f"Successfully wrote {len(questions)} questions to {output_file}")

def main():
    base_path = 'c:/Users/Subham/OneDrive/Music/Documents/GitHub/csv/python/quiz-main/source-code/src/data/'
    subjects = ['hindi', 'geo', 'gk', 'math', 'history', 'physics', 'science']
    target_count = 10000
    
    for subject in subjects:
        input_file = f"{base_path}{subject}.csv"
        output_file = f"{base_path}{subject}.csv"
        expand_csv_file(input_file, output_file, target_count)
    
    print("\nAll files expanded successfully!")

if __name__ == "__main__":
    main()
