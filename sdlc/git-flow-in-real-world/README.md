# Git Flow in Real World
> A branching and deployment strategy for real-world git flow — normal releases promote `dev` → `qat` → `uat` → `prod`, while a hotfix branches from `prod` as `prd_{date}` and syncs back to `dev`.

```mermaid
%%{init: { 'logLevel': 'debug', 'theme': 'base', 'gitGraph': {'rotateCommitLabel': false,'showBranches': true, 'showCommitLabel':true,'mainBranchName': 'dev'}} }%%
gitGraph
    commit id: "init"
    checkout dev
    branch qat
    commit id: "QAT Deployment #1"

    checkout dev    
    branch bug-b
    commit id: "Bug Fix B"
    checkout dev
    merge bug-b tag: "merge from bug-b"
    branch feat-a
    commit id: "Feature A"
    checkout dev
    merge feat-a tag: "merge from feat-a"
    checkout qat
    merge dev tag: "Merge from Dev to QAT"
    commit id: "QAT Deployment #2"
    branch uat
    checkout uat
    commit id: "UAT Deployment"
    branch prod
    checkout prod
    commit id: "Release to PROD"

    %% Hotfix flow
    branch prd_2025_04_07
    checkout prd_2025_04_07
    commit id: "Hotfix Commit and Deployment"
    checkout dev
    merge prd_2025_04_07 tag: "Hotfix Synced to Dev"
```