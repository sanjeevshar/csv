package com.wisdomworld.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for handling admission form submissions
 */
@WebServlet("/admission")
public class AdmissionServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        
        // Get form parameters
        String studentName = request.getParameter("studentName");
        String parentName = request.getParameter("parentName");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String grade = request.getParameter("grade");
        String message = request.getParameter("message");
        
        // Validate input
        if (studentName == null || studentName.isEmpty() ||
            parentName == null || parentName.isEmpty() ||
            email == null || email.isEmpty() ||
            phone == null || phone.isEmpty() ||
            grade == null || grade.isEmpty()) {
            
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
            out.println("<a href=\"admissions.html\" class=\"btn\">Go Back</a>");
            out.println("</div>");
            out.println("</body>");
            out.println("</html>");
            return;
        }
        
        // In a real application, you would save this data to a database
        // For demonstration, we'll just display a success message
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("<title>Admission Inquiry Submitted - Wisdom World School</title>");
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
        out.println("<h2>Admission Inquiry Submitted</h2>");
        out.println("<p>Thank you for your interest</p>");
        out.println("</div>");
        out.println("</section>");
        
        out.println("<section class=\"about-content\">");
        out.println("<div class=\"container\">");
        out.println("<div class=\"about-section\">");
        out.println("<h3>Thank You!</h3>");
        out.println("<p>Your admission inquiry has been successfully submitted.</p>");
        out.println("<p><strong>Student Name:</strong> " + studentName + "</p>");
        out.println("<p><strong>Parent/Guardian Name:</strong> " + parentName + "</p>");
        out.println("<p><strong>Email:</strong> " + email + "</p>");
        out.println("<p><strong>Phone:</strong> " + phone + "</p>");
        out.println("<p><strong>Grade Applying For:</strong> " + grade + "</p>");
        if (message != null && !message.isEmpty()) {
            out.println("<p><strong>Message:</strong> " + message + "</p>");
        }
        out.println("<p>Our admissions team will contact you shortly with further information.</p>");
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
        out.println("<p>Phone: +91 9354528600</p>");
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
        response.sendRedirect("admissions.html");
    }
}
