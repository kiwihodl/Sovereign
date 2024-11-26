# Setting Up Git and GitHub: A Developer's Foundation

<!-- <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs.com/api/get-video-url?videoKey=starter-lesson-2.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div> -->

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com/starter-lesson-2.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div>

## Lesson Overview
In this lesson, we'll establish one of the most important foundations of your development journey: version control with Git and GitHub. This knowledge will enable you to track your code, back it up in the cloud, and start building your developer portfolio.

## Prerequisites
- Visual Studio Code installed
- Terminal/Command Line basics
- GitHub account (we'll create one in this lesson)

## Key Learning Objectives
- Understand what Git and GitHub are and why they're essential
- Set up Git locally and connect it to GitHub
- Learn basic Git commands and workflow
- Create your first repository and commit
- Establish good Git habits for your developer journey

## What is Git and GitHub?

### Git: Your Local Version Control
- A version control system that tracks code changes over time
- Prevents accidental overwrites of your work
- Enables multiple developers to work on the same project safely
- Runs locally on your machine

### GitHub: Your Code in the Cloud
- A web-based platform that extends Git
- Cloud storage for your code repositories
- Enables code sharing and collaboration
- Includes features like:
  - Issue tracking
  - Pull requests
  - Project management tools
  - Code review capabilities

## Why Use GitHub?

### 1. Portfolio Building
- Acts as your "proof of work" as a developer
- Shows your coding activity through contribution graphs
- Demonstrates your consistency and dedication
- Serves as a public showcase of your projects

### 2. Collaboration and Learning
- Access millions of open-source projects
- Learn from other developers' code
- Contribute to real-world projects
- Get feedback on your code
- Work effectively in teams

### 3. Code Safety and Access
- All your code is safely stored in the cloud
- Access your projects from anywhere
- Never lose your work due to computer issues

## Essential GitHub Terminology

| Term | Definition |
|------|------------|
| Repository (Repo) | A folder containing your project files and version history |
| Commit | A saved change or addition to your code |
| Staging | Marking changes to be included in your next commit |
| Push | Sending your local commits to GitHub |
| Branch | A separate version of your code for new features or experiments |
| Pull Request (PR) | A request to merge changes from one branch to another |
| Clone | Creating a local copy of a remote repository |
| Fork | Creating your own copy of someone else's repository |

## Hands-on Practice

### Setting Up Git
1. Install Git from https://git-scm.com/downloads
2. Configure your identity:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Your First Repository
1. Create a new repository on GitHub named "hello-world"
2. Initialize Git locally:
```bash
git init
git add .
git commit -m "My first commit"
git remote add origin <your-repository-url>
git push -u origin main
```

## Basic Git Workflow Quick Reference

### Pushing Code to GitHub
```bash
# 1. Stage your changes
git add .

# 2. Commit your changes with a message
git commit -m "Describe your changes here"

# 3. Push to GitHub
git push
```

### Getting Code from GitHub
```bash
# If you already have the repository locally:
git pull

# If you need to download a repository:
git clone https://github.com/username/repository.git
```

## Building Good Habits

### Daily Git Practice
- Make it a goal to push code every day
- Even small changes count
- Use your GitHub contribution graph as motivation
- Track your progress over time

### Best Practices
1. Commit often with clear messages
2. Pull before you start working
3. Push your changes when you finish
4. Keep each project in its own repository
5. Include README files to explain your projects

## Common Issues and Solutions

### "No upstream branch" Error
If you see this error when pushing:
```bash
git push --set-upstream origin main
```

### Changes Not Showing Up
1. Check if changes are staged:
```bash
git status
```
2. Make sure you've committed:
```bash
git commit -m "Your message"
```
3. Verify you've pushed:
```bash
git push
```

## Exercise: Start Your Journey
1. Create your GitHub account if you haven't already
2. Set up Git locally using the commands we covered
3. Create your first repository named "hello-world"
4. Make your first commit
5. Push your code to GitHub
6. Make a habit of pushing code daily

## Additional Resources
- [GitHub Documentation](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- Practice with [GitHub Learning Lab](https://lab.github.com)

## Next Steps
- Start tracking all your code projects with Git
- Begin building your portfolio on GitHub
- Join the open-source community
- Collaborate with other developers

Remember: Every developer started where you are now. The key is consistency and persistence. Make pushing code to GitHub a daily habit, and you'll be amazed at your progress over time. 

Happy coding! 🚀