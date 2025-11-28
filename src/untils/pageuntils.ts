import { ElMessage } from "element-plus";

export async function copyTest(text:string){
    if(!navigator.clipboard){
        return new Promise((resolve, reject) => {
            try {
                var textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in Microsoft Edge.
                textarea.style.top = '0';
                textarea.style.left = '0';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                if(successful){
                    ElMessage.success("复制成功");
                    resolve("");
                }
                else{
                    ElMessage.error("复制失败");
                    reject("");
                }
            }catch (err) {
                ElMessage.error("复制失败");
                reject(err);
            }
        })
    }
    else{
        try {
            navigator.clipboard.writeText(text)
            ElMessage.success("复制成功");
        } catch {
            ElMessage.error("复制失败");
        }
    }
}