import * as vscode from 'vscode';
import * as fs from 'fs';
import path from 'path';

export interface SearchEngine {
    name: string;
    pattern: string;
}

export class ExternalBrowser {
    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext){
        this.context = context;
    }
    
    public open(term: string) {
        const searchConfig = vscode.workspace.getConfiguration('quickhelp');
        let searchQuery: string;
        if(searchConfig.get("searchPattern") !== ''){
            searchQuery = (searchConfig.get("searchPattern") as string).replace("{term}", term);
            return vscode.env.openExternal(vscode.Uri.parse(searchQuery));
        }
        
        const fileContent = fs.readFileSync(path.resolve(__dirname + '/searchEngines.json'),'utf8');
        const searchEngines = JSON.parse(fileContent) as SearchEngine[];
        const searchEngine = searchEngines.find(i => i.name === searchConfig.get("searchEngine"));
        if (searchEngine === undefined) {
            return vscode.window.showErrorMessage("Selected Search engine not supported");
        }
        searchQuery = searchEngine.pattern.replace("{term}", term);
    
        return vscode.env.openExternal(vscode.Uri.parse(searchQuery));
    }
}

