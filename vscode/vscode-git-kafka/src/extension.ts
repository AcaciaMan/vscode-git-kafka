// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from "child_process";
import { ProviderGitGrep } from './m_grep/providerGitGrep';
import { ProviderDirsPaths } from './m_dirs_paths/providerDirsPaths';
import { M_Global } from './m_util/m_global';
import { M_Search } from './m_results/m_search';
import { M_Util } from './m_util/m_util';
import { M_Solr } from './m_util/m_solr';
import { ProviderSolr } from './m_solr/providerSolr';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-git-kafka" is now active!');



	const m_global = M_Global.getInstance();
  const mUtil = M_Util.getInstance();
  const mSolr = M_Solr.getInstance();

    let workspaceUUID = vscode.workspace
      .getConfiguration("vscode-git-kafka")
      .get("workspaceUUID") as string;

	if (workspaceUUID==="" || 
    workspaceUUID===undefined ||
    // if the workspaceUUID is not a valid UUID
    !mUtil.isUUID(workspaceUUID)
  ) {
		workspaceUUID = mUtil.getUUID();
		vscode.workspace.getConfiguration("vscode-git-kafka").update("workspaceUUID", workspaceUUID, vscode.ConfigurationTarget.Workspace);
	}  

	m_global.setWorkspaceUUID(workspaceUUID);

  let sortType = vscode.workspace
    .getConfiguration("vscode-git-kafka")
    .get("sort") as string;

  m_global.sortType = sortType;

  if (sortType === "" || sortType === undefined) {
    sortType = M_Search.getInstance().enumSortType.ClicksHighLow;
      m_global.setSortType(sortType);

  }

	// get includeDirs, excludeDirs, and pathSpec from settings
  const includeDirs = vscode.workspace.getConfiguration("vscode-git-kafka").get("includeDirs") as string;
  const excludeDirs = vscode.workspace.getConfiguration("vscode-git-kafka").get("excludeDirs") as string;
	const pathSpec = vscode.workspace.getConfiguration("vscode-git-kafka").get("pathSpec") as string;
	m_global.setDirs(
    includeDirs,
    excludeDirs,
    vscode.workspace.workspaceFolders?.[0]
  );
	m_global.setPathSpec(pathSpec);

  mSolr.refresh();

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

    const providerGitGrep = new ProviderGitGrep(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ProviderGitGrep.viewType,
			providerGitGrep
		)
	);

	const providerDirsPaths = new ProviderDirsPaths(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ProviderDirsPaths.viewType,
			providerDirsPaths
		)
	);

  if (mSolr.hasSolrClient()) {
    const providerSolr = new ProviderSolr(context);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        ProviderSolr.viewType,
        providerSolr
      )
    );
  }

}

// This method is called when your extension is deactivated
export function deactivate() {}
