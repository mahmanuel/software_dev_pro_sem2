from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from issues.models import Category, Priority, StatusType, Issue, IssueStatus

User = get_user_model()


class Command(BaseCommand):
    help = "Creates initial data for the application"

    def handle(self, *args, **kwargs):
        self.stdout.write("Creating initial data...")

        # Create admin user
        if not User.objects.filter(email="admin@example.com").exists():
            admin = User.objects.create_user(
                email="admin@example.com",
                password="adminpassword",
                first_name="Admin",
                last_name="User",
                role="ADMIN",
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write(self.style.SUCCESS(f"Created admin user: {admin.email}"))

        # Create faculty user
        if not User.objects.filter(email="faculty@example.com").exists():
            faculty = User.objects.create_user(
                email="faculty@example.com",
                password="facultypassword",
                first_name="Faculty",
                last_name="User",
                role="FACULTY",
                department="Computer Science",
            )
            self.stdout.write(
                self.style.SUCCESS(f"Created faculty user: {faculty.email}")
            )

        # Create student user
        if not User.objects.filter(email="student@example.com").exists():
            student = User.objects.create_user(
                email="student@example.com",
                password="studentpassword",
                first_name="Student",
                last_name="User",
                role="STUDENT",
            )
            self.stdout.write(
                self.style.SUCCESS(f"Created student user: {student.email}")
            )

        # Create sample issues
        if Issue.objects.count() == 0:
            student = User.objects.get(email="student@example.com")
            faculty = User.objects.get(email="faculty@example.com")
            admin = User.objects.get(email="admin@example.com")

            # Issue 1
            issue1 = Issue.objects.create(
                title="Grade dispute for CS101 Final Exam",
                description="I believe my final exam grade was calculated incorrectly. I should have received 85 instead of 75.",
                category=Category.GRADE_DISPUTE,
                priority=Priority.HIGH,
                submitted_by=student,
            )

            IssueStatus.objects.create(
                issue=issue1, status=StatusType.SUBMITTED, updated_by=student
            )

            self.stdout.write(self.style.SUCCESS(f"Created issue: {issue1.title}"))

            # Issue 2
            issue2 = Issue.objects.create(
                title="Schedule conflict with required courses",
                description="Two of my required courses for graduation are scheduled at the same time next semester.",
                category=Category.CLASS_SCHEDULE,
                priority=Priority.MEDIUM,
                submitted_by=student,
                assigned_to=faculty,
            )

            IssueStatus.objects.create(
                issue=issue2, status=StatusType.SUBMITTED, updated_by=student
            )

            IssueStatus.objects.create(
                issue=issue2,
                status=StatusType.ASSIGNED,
                notes="Assigned to CS department faculty",
                updated_by=admin,
            )

            IssueStatus.objects.create(
                issue=issue2,
                status=StatusType.IN_PROGRESS,
                notes="Working with the registrar to resolve this conflict",
                updated_by=faculty,
            )

            self.stdout.write(self.style.SUCCESS(f"Created issue: {issue2.title}"))

            # Issue 3
            issue3 = Issue.objects.create(
                title="Missing prerequisite override",
                description="I need an override for the prerequisite for CS301 as I have equivalent experience from my internship.",
                category=Category.COURSE_REGISTRATION,
                priority=Priority.LOW,
                submitted_by=student,
                assigned_to=faculty,
            )

            IssueStatus.objects.create(
                issue=issue3, status=StatusType.SUBMITTED, updated_by=student
            )

            IssueStatus.objects.create(
                issue=issue3, status=StatusType.ASSIGNED, updated_by=admin
            )

            IssueStatus.objects.create(
                issue=issue3,
                status=StatusType.RESOLVED,
                notes="Override approved based on work experience",
                updated_by=faculty,
            )

            self.stdout.write(self.style.SUCCESS(f"Created issue: {issue3.title}"))

        self.stdout.write(self.style.SUCCESS("Initial data created successfully!"))
