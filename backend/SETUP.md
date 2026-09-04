# Google Sheet + email backend setup

The destination Sheet is already prepared:

https://docs.google.com/spreadsheets/d/18dEH7_PCLy7LtugJXSAE9omnVvaEux_RbUqmMBJNHHQ/edit

1. Open https://script.google.com and choose **New project**.
2. Replace the editor contents with everything from `Code.gs`.
3. Rename the project to **CityScape Form Backend** and save.
4. Choose **Deploy → New deployment**.
5. Select **Web app**.
6. Set **Execute as** to **Me**.
7. Set **Who has access** to **Anyone** so visitors can submit the public form.
8. Select **Deploy**, review Google's permission screen, and authorize Sheets plus email access.
9. Copy the Web App URL ending in `/exec`.
10. Paste it between the quotes in the project's `config.js`.
11. Upload the updated project to GitHub Pages and submit one test entry.

Each valid submission will be appended to the `Submissions` tab and emailed to `intellrecurso.bd@gmail.com`.
