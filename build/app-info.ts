import dayjs from "dayjs";
export default function getAppInfo(pkg: any) {
    return JSON.stringify({
        pkg,
        lastBuildTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });
}
