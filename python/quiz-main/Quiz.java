import java.io.*;
import java.util.*;

public class Quiz {
    private static List<String[]> questionBank;
    private static Random random;
    private static Scanner scanner;
    
    public static void main(String[] args) {
        random = new Random();
        scanner = new Scanner(System.in);
        
        // Use command line argument or default file
        String questionsFile = args.length > 0 ? args[0] : "qbank1.csv";
        
        // Load questions
        questionBank = readQuestions(questionsFile);
        if (questionBank == null || questionBank.isEmpty()) {
            System.out.println("Failed to load questions. Exiting.");
            return;
        }
        
        int totalQuestions = questionBank.size() - 1; // Exclude header
        int askCount = getQuestionCount(totalQuestions);
        
        // Start quiz
        startQuiz(askCount, totalQuestions);
    }
    
    private static List<String[]> readQuestions(String fileName) {
        List<String[]> data = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            while ((line = br.readLine()) != null) {
                // Handle quoted fields in CSV
                String[] row = parseCSVLine(line);
                data.add(row);
            }
        } catch (FileNotFoundException e) {
            System.out.println("Questions File not found. Please check if file " + fileName + " is present.");
            return null;
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
            return null;
        }
        return data;
    }
    
    private static String[] parseCSVLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        result.add(current.toString().trim());
        
        return result.toArray(new String[0]);
    }
    
    private static int getQuestionCount(int totalQuestions) {
        int count = 0;
        while (count < 1 || count > totalQuestions) {
            System.out.print("How many questions do you want to try Today (Max: " + totalQuestions + "): ");
            try {
                count = Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid number.");
            }
        }
        return count;
    }
    
    private static void startQuiz(int askCount, int totalQuestions) {
        int count = 0;
        int score = 0;
        int attempted = 0;
        long startTime = System.currentTimeMillis();
        
        // Track used question indices to avoid repeats
        Set<Integer> usedIndices = new HashSet<>();
        
        while (count < askCount) {
            // Pick a random question from question bank (skip header at index 0)
            int num;
            do {
                num = random.nextInt(totalQuestions) + 1;
            } while (usedIndices.contains(num));
            usedIndices.add(num);
            
            String[] question = questionBank.get(num);
            
            System.out.println("\n");
            askQuestion(question);
            
            String answer = getAnswer(question);
            
            if (answer.equals("s")) {
                System.out.println("Skipping this question.");
                count++;
                continue;
            } else if (answer.equals("x")) {
                break;
            }
            
            // Check the answer
            if (answer.equals(question[2].toLowerCase())) {
                score++;
                attempted++;
                System.out.println("\nShabaash !!! Correct Answer!");
            } else {
                System.out.println("\nWrong Answer! The correct answer is: " + question[2]);
                attempted++;
            }
            
            count++;
            System.out.println("==============================================\n");
            System.out.print("Press Enter to continue to the next question or x <Enter> to exit: ");
            String resp = scanner.nextLine();
            if (resp.equals("x")) {
                break;
            }
            
            // Clear screen (platform dependent)
            clearScreen();
        }
        
        finishQuiz(attempted, score, startTime);
    }
    
    private static void askQuestion(String[] question) {
        // Field [1] is the question itself
        System.out.println(question[1] + "\n");
        
        // Print choices a to d for the question
        char ch = 'a';
        for (int i = 3; i <= 6; i++) {
            if (i < question.length) {
                System.out.println("\t" + ch + ")  " + question[i]);
                ch++;
            }
        }
    }
    
    private static String getAnswer(String[] question) {
        while (true) {
            System.out.println("==============================================");
            System.out.print("Enter your choice( a - d  s: Skip, h: Hindi translation,  x: Exit): ");
            String answer = scanner.nextLine().toLowerCase();
            
            if (answer.matches("[abcdsx]")) {
                if (answer.equals("h")) {
                    // Check if audio file exists
                    if (question.length > 7 && !question[7].isEmpty()) {
                        String clip = "./audio/" + question[7];
                        playAudio(clip);
                    } else {
                        System.out.println("Sorry! Audio file for the question is not available");
                    }
                    continue;
                }
                return answer;
            } else {
                System.out.println("Invalid choice. Please enter a valid option.");
            }
        }
    }
    
    private static void playAudio(String clip) {
        File file = new File(clip);
        if (file.exists()) {
            System.out.println("Playing Question audio...");
            // Audio playback would require additional libraries like javax.sound.sampled
            // For simplicity, we just print a message
        } else {
            System.out.println("Sorry! Audio file for the question is not available");
        }
    }
    
    private static void finishQuiz(int attempted, int score, long startTime) {
        long endTime = System.currentTimeMillis();
        long timeTaken = (endTime - startTime) / 1000;
        
        System.out.println("==============================================\n");
        System.out.println("Quiz completed. Thank you for participating!\n");
        System.out.println("Your score is " + score + " out of " + attempted + "\n");
        System.out.println("Total time taken for the quiz: " + timeTaken + " seconds\n");
        System.out.println("Exiting the quiz. Goodbye!");
        
        scanner.close();
    }
    
    private static void clearScreen() {
        try {
            if (System.getProperty("os.name").contains("Windows")) {
                new ProcessBuilder("cmd", "/c", "cls").inheritIO().start().waitFor();
            } else {
                System.out.print("\033[H\033[2J");
                System.out.flush();
            }
        } catch (Exception e) {
            // If clearing screen fails, just print newlines
            for (int i = 0; i < 50; i++) {
                System.out.println();
            }
        }
    }
}
