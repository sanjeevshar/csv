package com.wisdomworld.servlet;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for handling contact form submissions
 */
@WebServlet("/contact")
public class ContactServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static final String DATA_FILE = "WEB-INF/data/contact_data.json";

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        
        // Get form parameters
        String name = request.getParameter("name");
        String childName = request.getParameter("childName");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String subject = request.getParameter("subject");
        String message = request.getParameter("message");
        
        // Validate input
        if (name == null || name.isEmpty() ||
            email == null || email.isEmpty() ||
            subject == null || subject.isEmpty() ||
            message == null || message.isEmpty()) {
            
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Error - Wisdom World School</title>");
            out.println("<link rel=\"stylesheet\" href=\"css/style.css\">");
            out.println("</head>");
            out.println("<body>");
            out.println("<div class=\"container\" style=\"padding: 2rem; text-align: center;\">");
            out.println("<h2 style=\"color: #f5576c;\">Error</h2>");
            out.println("<p>Please fill in all required fields.</p>");
            out.println("<a href=\"contact.html\" class=\"btn\">Go Back</a>");
            out.println("</div>");
            out.println("</body>");
            out.println("</html>");
            return;
        }
        
        // Save contact data to JSON file
        saveContactData(name, childName, grade, subjectSelect, email, phone, subject, message);
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("<title>Message Sent - Wisdom World School</title>");
        out.println("<link rel=\"stylesheet\" href=\"css/style.css\">");
        out.println("</head>");
        out.println("<body>");
        out.println("<header>");
        out.println("<div class=\"container\">");
        out.println("<div class=\"logo\">");
        out.println("<h1>Wisdom World School</h1>");
        out.println("<p class=\"tagline\">Naichana</p>");
        out.println("</div>");
        out.println("<nav>");
        out.println("<ul>");
        out.println("<li><a href=\"index.html\">Home</a></li>");
        out.println("<li><a href=\"about.html\">About</a></li>");
        out.println("<li><a href=\"academics.html\">Academics</a></li>");
        out.println("<li><a href=\"admissions.html\">Admissions</a></li>");
        out.println("<li><a href=\"contact.html\">Contact</a></li>");
        out.println("</ul>");
        out.println("</nav>");
        out.println("</div>");
        out.println("</header>");
        
        out.println("<section class=\"page-header\">");
        out.println("<div class=\"container\">");
        out.println("<h2>Message Sent</h2>");
        out.println("<p>We have received your message</p>");
        out.println("</div>");
        out.println("</section>");
        
        out.println("<section class=\"about-content\">");
        out.println("<div class=\"container\">");
        out.println("<div class=\"about-section\">");
        out.println("<h3>Thank You for Contacting Us!</h3>");
        out.println("<p>Your message has been successfully sent to our team.</p>");
        out.println("<p><strong>Name:</strong> " + name + "</p>");
        if (childName != null && !childName.isEmpty()) {
            out.println("<p><strong>Child's Name:</strong> " + childName + "</p>");
        }
        if (grade != null && !grade.isEmpty()) {
            out.println("<p><strong>Grade:</strong> " + grade + "</p>");
        }
        if (subjectSelect != null && !subjectSelect.isEmpty()) {
            out.println("<p><strong>Subject:</strong> " + subjectSelect + "</p>");
        }
        out.println("<p><strong>Email:</strong> " + email + "</p>");
        if (phone != null && !phone.isEmpty()) {
            out.println("<p><strong>Phone:</strong> " + phone + "</p>");
        }
        out.println("<p><strong>Subject:</strong> " + subject + "</p>");
        out.println("<p><strong>Message:</strong> " + message + "</p>");
        out.println("<p>We will get back to you as soon as possible.</p>");
        out.println("<br>");
        out.println("<a href=\"index.html\" class=\"btn\">Return to Home</a>");
        out.println("</div>");
        out.println("</div>");
        out.println("</section>");
        
        out.println("<footer>");
        out.println("<div class=\"container\">");
        out.println("<div class=\"footer-content\">");
        out.println("<div class=\"footer-section\">");
        out.println("<h3>Wisdom World School</h3>");
        out.println("<p>Naichana</p>");
        out.println("<p>Excellence in Education</p>");
        out.println("</div>");
        out.println("<div class=\"footer-section\">");
        out.println("<h3>Quick Links</h3>");
        out.println("<ul>");
        out.println("<li><a href=\"about.html\">About Us</a></li>");
        out.println("<li><a href=\"academics.html\">Academics</a></li>");
        out.println("<li><a href=\"admissions.html\">Admissions</a></li>");
        out.println("<li><a href=\"contact.html\">Contact</a></li>");
        out.println("</ul>");
        out.println("</div>");
        out.println("<div class=\"footer-section\">");
        out.println("<h3>Contact Info</h3>");
        out.println("<p>Email: info@wisdomworldschool.com</p>");
        out.println("<p>Phone: +91 XXXXX XXXXX</p>");
        out.println("</div>");
        out.println("</div>");
        out.println("<div class=\"footer-bottom\">");
        out.println("<p>&copy; 2025 Wisdom World School Naichana. All rights reserved.</p>");
        out.println("</div>");
        out.println("</div>");
        out.println("</footer>");
        
        out.println("</body>");
        out.println("</html>");
        
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect("contact.html");
    }

    private void saveContactData(String name, String childName, String grade, String subjectSelect, String email, String phone, String subject, String message) {
        try {
            String dataFilePath = getServletContext().getRealPath(DATA_FILE);
            Path path = Paths.get(dataFilePath);
            
            // Create parent directories if they don't exist
            Path parentDir = path.getParent();
            if (parentDir != null && !Files.exists(parentDir)) {
                Files.createDirectories(parentDir);
            }
            
            // Read existing data
            List<Map<String, String>> contactList = new ArrayList<>();
            if (Files.exists(path)) {
                String content = new String(Files.readAllBytes(path));
                if (content != null && !content.trim().isEmpty() && !content.equals("[]")) {
                    // Simple JSON parsing (for demonstration)
                    // In production, use a proper JSON library like Jackson or Gson
                    content = content.trim();
                    if (content.startsWith("[") && content.endsWith("]")) {
                        content = content.substring(1, content.length() - 1);
                        if (!content.trim().isEmpty()) {
                            String[] entries = content.split("\\},\\{");
                            for (String entry : entries) {
                                entry = entry.replace("{", "").replace("}", "").replace("\"", "");
                                Map<String, String> data = new HashMap<>();
                                String[] pairs = entry.split(",");
                                for (String pair : pairs) {
                                    String[] keyValue = pair.split(":");
                                    if (keyValue.length == 2) {
                                        data.put(keyValue[0].trim(), keyValue[1].trim());
                                    }
                                }
                                if (!data.isEmpty()) {
                                    contactList.add(data);
                                }
                            }
                        }
                    }
                }
            }
            
            // Create new entry
            Map<String, String> newEntry = new HashMap<>();
            newEntry.put("name", name);
            if (childName != null && !childName.isEmpty()) {
                newEntry.put("childName", childName);
            }
            if (grade != null && !grade.isEmpty()) {
                newEntry.put("grade", grade);
            }
            if (subjectSelect != null && !subjectSelect.isEmpty()) {
                newEntry.put("subjectSelect", subjectSelect);
            }
            newEntry.put("email", email);
            if (phone != null && !phone.isEmpty()) {
                newEntry.put("phone", phone);
            }
            newEntry.put("subject", subject);
            newEntry.put("message", message);
            newEntry.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            contactList.add(newEntry);
            
            // Write back to file
            StringBuilder json = new StringBuilder("[\n");
            for (int i = 0; i < contactList.size(); i++) {
                Map<String, String> entry = contactList.get(i);
                json.append("  {\n");
                int j = 0;
                for (Map.Entry<String, String> e : entry.entrySet()) {
                    json.append("    \"").append(e.getKey()).append("\": \"").append(e.getValue()).append("\"");
                    if (j < entry.size() - 1) {
                        json.append(",");
                    }
                    json.append("\n");
                    j++;
                }
                json.append("  }");
                if (i < contactList.size() - 1) {
                    json.append(",");
                }
                json.append("\n");
            }
            json.append("]");
            
            Files.write(path, json.toString().getBytes());
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
