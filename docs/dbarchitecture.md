# Database Architecture

```mermaid
erDiagram
    QuestionPaper ||--o{ MarkingScheme : "same courseCode, slot, examType"
    QuestionPaper ||--o{ AnswerSheet : "same slot, examType"
    QuestionPaper ||--o{ MarkingSheet : "same slot, examType"

    MarkingScheme ||--o{ MarkingSheet : "same courseCode, slot, examType"

    AnswerSheet ||--|| MarkingSheet : "same rollNo"

    QuestionPaper {
        string id PK
        string subject
        string slot
        string courseCode
        ExamType examType
        int totalMarks
        string question1
        int mark1
        string question2
        int mark2
        string question3
        int mark3
        string question4
        int mark4
        string question5
        int mark5
        string question6
        int mark6
        string question7
        int mark7
        string question8
        int mark8
        string question9
        int mark9
        string question10
        int mark10
    }

    MarkingScheme {
        string id PK
        string courseCode
        string slot
        ExamType examType
        int mark1
        string criteria1
        int mark2
        string criteria2
        int mark3
        string criteria3
        int mark4
        string criteria4
        int mark5
        string criteria5
        int mark6
        string criteria6
        int mark7
        string criteria7
        int mark8
        string criteria8
        int mark9
        string criteria9
        int mark10
        string criteria10
    }

    AnswerSheet {
        string rollNo PK
        string name
        string slot
        ExamType examType
        string answer1
        string answer2
        string answer3
        string answer4
        string answer5
        string answer6
        string answer7
        string answer8
        string answer9
        string answer10
    }

    MarkingSheet {
        string rollNo PK
        string name
        string slot
        ExamType examType
        int totalMarks
        int answer1
        int answer2
        int answer3
        int answer4
        int answer5
        int answer6
        int answer7
        int answer8
        int answer9
        int answer10
    }