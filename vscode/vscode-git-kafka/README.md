# vscode-git-kafka
Visual Studio Code extension to invoke git commands and store results in SOLR search index server.

For example, git grep search can return many rows before and after search text
```cmd
git grep -i -A 50 -B 50 import
```
, and then with SOLR search is easy to find all sleep imports.

Git is great version control system with good commands in scripts. Visual Studio extension to publish commands results in windows UI and and store results in SOLR search index server.

Execute - run git command in current workspace folder, Execute Dirs - run git command recursively in subdirectories set in DIRS PATHS.

SOLR Search - do SOLR search in git Excute command output text, Search Dirs - do SOLR search in Execute Dirs command output text.

## v0.0.3 Added results sorting
![Screenshot 2025-02-05 121000](https://github.com/user-attachments/assets/214bad36-21e0-4919-9763-94cda66274ce)

## v1.0.0 Added git commands results store in Solr
![Screenshot 2025-02-05 121200](https://github.com/user-attachments/assets/39d4a354-3820-411e-b233-c7b4785bccaa)

![Screenshot_solr_admin](https://github.com/user-attachments/assets/d3389d33-c866-45eb-84ce-dfb28359394f)

## Solr
Execution results are stored in Solr search server. 

```cmd
bin\solr.cmd start 
```

Make new Solr core "vscodegit", do schema and solrconfig [config](/vscode/vscode-git-kafka/config)

Now You have set up vscode-git-kafka extension!

## v1.1.0 Added git log command
![Screenshot_git_log](https://github.com/user-attachments/assets/2e2ac73d-7a10-4475-a3cf-b4cac7c0f33b)

## v1.3.0 Added d3 and d3-cloud project word cloud
![Screenshot_word_cloud](https://github.com/user-attachments/assets/ab74be71-561a-459f-84ca-e038c49eacd6)

## v1.3.3  Updated solr config text_en_splitting
