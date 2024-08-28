import fs from 'node:fs'

export default function checkAndRemove(path: string) {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path)
        console.log(path);
        
    }
}