package com.wisdomworld.servlet;

import java.io.*;
import java.nio.file.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for serving contact data to admin panel
 */
@WebServlet("/admin-data")
public class AdminDataServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static final String DATA_FILE = "WEB-INF/data/contact_data.json";

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            String dataFilePath = getServletContext().getRealPath(DATA_FILE);
            Path path = Paths.get(dataFilePath);
            
            if (Files.exists(path)) {
                String content = new String(Files.readAllBytes(path));
                out.print(content);
            } else {
                out.print("[]");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            out.print("[]");
        }
        
        out.close();
    }
}
