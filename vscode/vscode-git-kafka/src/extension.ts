// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-git-kafka" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vscode-git-kafka.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vscode-git-kafka!');
	});


	    let disposable2 = vscode.commands.registerCommand(
        "vscode-git-kafka.gitGrep",
        async () => {
          // Prompt the user to enter a search term
          const searchTerm = await vscode.window.showInputBox({
            prompt: "Enter search term for git grep",
          });
          if (!searchTerm) {
            vscode.window.showErrorMessage("Search term is required");
            return;
          }

          // Get the workspace folder
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found");
            return;
          }

          // Run git grep command
          const command = `git grep ${searchTerm}`;
          exec(
            command,
            { cwd: workspaceFolder.uri.fsPath },
            (error, stdout, stderr) => {
              if (error) {
				vscode.window.showErrorMessage(`Error: ${error.message}`);
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
              }

              // Display the results in an output channel
              const outputChannel =
                vscode.window.createOutputChannel("Git Grep Results");
              outputChannel.append(stdout);
              outputChannel.show();
            }
          );
        }
      );

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
