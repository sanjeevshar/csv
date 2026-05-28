# Wisdom World School Naichana - School Website

A complete school website for Wisdom World School Naichana built with Java Servlets, HTML, and CSS.

## Features

- **Responsive Design**: Modern, mobile-friendly layout
- **Multiple Pages**: Home, About, Academics, Admissions, Contact
- **Form Handling**: Java servlets for admission inquiries and contact forms
- **Beautiful UI**: Professional styling with CSS
- **Error Pages**: Custom 404 and 500 error pages

## Project Structure

```
wisdom-world-school/
├── pom.xml                                    # Maven configuration
├── README.md                                  # Project documentation
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── wisdomworld/
        │           └── servlet/
        │               ├── AdmissionServlet.java    # Handles admission form submissions
        │               ├── ContactServlet.java      # Handles contact form submissions
        │               └── HomeServlet.java         # Home page redirect
        └── webapp/
            ├── css/
            │   └── style.css                    # Main stylesheet
            ├── WEB-INF/
            │   └── web.xml                      # Web application configuration
            ├── index.html                       # Home page
            ├── about.html                       # About page
            ├── academics.html                   # Academics page
            ├── admissions.html                   # Admissions page
            ├── contact.html                     # Contact page
            ├── error-404.html                   # 404 error page
            └── error-500.html                   # 500 error page
```

## Prerequisites

- Java Development Kit (JDK) 11 or higher
- Apache Maven 3.6 or higher
- Apache Tomcat 9.0 or higher (or any servlet container)
- An IDE (IntelliJ IDEA, Eclipse, or NetBeans) - optional

## Setup Instructions

### 1. Clone or Download the Project

Navigate to the project directory:
```bash
cd "c:\Users\Subham\OneDrive\Music\Documents\GitHub\csv\python\New folder"
```

### 2. Build the Project with Maven

Run the following command to build the project:
```bash
mvn clean package
```

This will create a WAR file in the `target` directory: `target/wisdom-world-school.war`

### 3. Deploy to Tomcat

#### Option A: Manual Deployment
1. Copy the WAR file to Tomcat's `webapps` directory:
   ```bash
   copy target\wisdom-world-school.war C:\path\to\tomcat\webapps\
   ```

2. Start Tomcat server

3. Access the application at: `http://localhost:8080/wisdom-world-school/`

#### Option B: IDE Deployment (IntelliJ IDEA)
1. Open the project in IntelliJ IDEA
2. Configure Tomcat server in Run/Debug Configurations
3. Add the artifact (WAR exploded) to the server
4. Run the server

#### Option C: IDE Deployment (Eclipse)
1. Import the project as a Maven project
2. Configure Tomcat server in Server view
3. Add the project to the server
4. Run the server

## Usage

### Accessing the Website

Once deployed, access the website at:
```
http://localhost:8080/wisdom-world-school/
```

### Pages

- **Home**: `http://localhost:8080/wisdom-world-school/index.html`
- **About**: `http://localhost:8080/wisdom-world-school/about.html`
- **Academics**: `http://localhost:8080/wisdom-world-school/academics.html`
- **Admissions**: `http://localhost:8080/wisdom-world-school/admissions.html`
- **Contact**: `http://localhost:8080/wisdom-world-school/contact.html`

### Form Submissions

- **Admission Inquiry**: Fills out the form on the Admissions page and submits to `/admission` servlet
- **Contact Form**: Fills out the form on the Contact page and submits to `/contact` servlet

## Customization

### Update Contact Information

Edit the contact details in:
- `contact.html` - Update address, phone, email, and office hours
- All HTML pages' footer sections

### Update School Information

Edit school-specific content in:
- `index.html` - Hero section, features, news
- `about.html` - Mission, vision, values, history
- `academics.html` - Curriculum, subjects, methodology
- `admissions.html` - Admission process, documents, age criteria

### Customize Styling

Modify the CSS in `src/main/webapp/css/style.css` to change:
- Colors (currently using blue gradient: #1e3c72 to #2a5298)
- Fonts
- Layout
- Responsive breakpoints

### Add Database Integration

To persist form submissions, you can:

1. Add database dependencies to `pom.xml`:
```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

2. Update servlets to save data to database instead of just displaying it

3. Create database tables for admissions and contact messages

## Technologies Used

- **Backend**: Java 11, Java Servlet API 4.0.1
- **Frontend**: HTML5, CSS3
- **Build Tool**: Apache Maven
- **Server**: Apache Tomcat (or any servlet container)

## Future Enhancements

- Add database integration for storing inquiries
- Implement user authentication for admin panel
- Add image gallery
- Integrate Google Maps for location
- Add news/blog section with CMS
- Implement email notifications for form submissions
- Add multilingual support
- Create admin dashboard for managing content

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, you can:
- Change Tomcat's port in `server.xml`
- Or stop the process using port 8080

### Build Errors

If you encounter build errors:
- Ensure Java 11+ is installed: `java -version`
- Ensure Maven is installed: `mvn -version`
- Run `mvn clean` before `mvn package`

### Servlet Not Working

If servlets are not working:
- Check that `web.xml` is correctly configured
- Verify servlet mappings in `web.xml`
- Check Tomcat logs for errors

## License

This project is created for Wisdom World School Naichana.

## Contact

For questions or support, please contact the school administration.

---

**Note**: This is a basic school website template. For production use, consider adding:
- SSL/HTTPS configuration
- Database integration
- Security features (CSRF protection, input validation)
- Backup and recovery systems
- Monitoring and logging
