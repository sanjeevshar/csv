import csv
# pip install deep-translator
from deep_translator import GoogleTranslator

input_file = 'english.txt'
output_file = 'traslation.csv'
def translate_words(input_file, output_file):
    # Initialize the translator
    translator = GoogleTranslator(source='en', target='hi')
    
    try:
        # Read English words
        with open(input_file, 'r', encoding='utf-8') as f:
            words = [line.strip() for line in f if line.strip()]

        if not words:
            print("The input file is empty.")
            return

        print(f"Translating {len(words)} words..")

        # Write to CSV
        with open(output_file, 'a', newline='', encoding='utf-8-sig') as csvfile:
            writer = csv.writer(csvfile)
            # Write header
            #writer.writerow(['English', 'Hindi'])

            for word in words:
                try:
                    # Perform translation
                    translated_text = translator.translate(word)
                    print(f"'{word}' -> '{translated_text}'")
                    # Write to CSV
                    writer.writerow([word, translated_text])
                except Exception as e:
                    print(f"Error with '{word}': {e}")
                    writer.writerow([word, "Error"])

        print(f"Done! Results saved to {output_file}")

    except FileNotFoundError:
        print(f"Error: Could not find '{input_file}'")

if __name__ == "__main__":
    translate_words(input_file, output_file)