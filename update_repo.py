import subprocess
import os

# Define the path to your repository
repo_path = '~/flask-app'

# Change to the repository directory
os.chdir(repo_path)

# Execute git pull command
try:
    result = subprocess.run(['git', 'pull'], check=True, text=True, capture_output=True)
    print("Git pull successful:")
    print(result.stdout)
except subprocess.CalledProcessError as e:
    print("Error during git pull:")
    print(e.stderr)
