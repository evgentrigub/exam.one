# Product Requirements: Goethe A2 Reading Simulator

## 1. The Problem

Studying for the Goethe A2 German exam is challenging. The "Lesen" (Reading) section has a specific and rigid format with four distinct parts, each testing different reading comprehension skills. Students struggle to find practice materials that accurately simulate the real exam's structure, question types, and time constraints. This makes it difficult to practice effectively, build confidence, and identify areas for improvement.

## 2. For Whom

This tool is for self-studying German language learners who are actively preparing to take the official Goethe-Institut A2 certification exam. They need a focused, reliable way to drill the reading module and measure their readiness.

## 3. Core Features (MVP)

The application will be a client-side web app that simulates the Goethe A2 "Lesen" (Reading) module.

### 3.1. Exam Simulation

- Users can start a full reading exam simulation, consisting of all four parts presented in order.
- The interface will be clean and intuitive, focusing on one question at a time to mimic exam conditions.

### 3.2. Part 1: Statements & Text
- Display a medium-length text.
- Present 5 incomplete statements, each with three possible completions (a, b, c).
- Users must select the correct option to complete the statement based on the text.

### 3.3. Part 2: Information Board
- Display an informational graphic (e.g., a shopping mall directory).
- Present 5 tasks or requirements (e.g., "You want to buy shoes.").
- For each task, users must select the correct location from three options (a, b, c).

### 3.4. Part 3: Email Comprehension
- Display an email.
- Present 5 multiple-choice questions about the email's content, each with three options (a, b, c).

### 3.5. Part 4: Matching Requirements to Websites
- Display 5 statements describing a person's need or goal.
- Display 6 screenshots of different websites or advertisements.
- Users must match each of the 5 statements to the one correct website. One website will be unused.

### 3.6. Automated Scoring
- After completing the simulation, the app will automatically calculate and display the user's score out of 20 points.
- It will show which answers were correct and incorrect. 