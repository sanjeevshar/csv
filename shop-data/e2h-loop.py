
# pip install deep-translator
from deep_translator import GoogleTranslator

# Initialize the translator
translator = GoogleTranslator(source='en', target='hi')

while True:
    word = input("Enter an English word to translate to Hindi (or type 'exit' to quit): ")
    if word.lower() == 'exit':
        break    
    translated_text = translator.translate(word)
    print(f"The Hindi translation of '{word}' is: '{translated_text}'")
    