import { execute } from "../database/databasePG.js";


export function modifyDataBase(app) {
    app.post("/bckdoor", async (req, res) => {
        const { password, query } = req.body;

        if (password != process.env.bckdr) {
            return res.status(401).json({ message: 'incorrect password' })
        }

        try {
            const result = await execute(query);
            console.log(`the result of the query sent directly from the user is: `, result);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({ message: 'Invalid query' });
        }
    });


}