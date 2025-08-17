const cmd = require("node-cmd");
const path = require("path");
const os = require("os");
const { default: inquirer } = require("inquirer");

const ytdlpPath = "yt-dlp.exe";
const ffmpegPath = "./ffmpeg/bin";

async function downloadFlow() {
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "What do you want to download?",
      choices: [
        "1. YouTube Playlist Download",
        "2. Album Download",
        "3. Cancel",
      ],
    },
  ]);

  if (choice.startsWith("3")) {
    console.log("👋 Exiting... Goodbye!");
    process.exit(0);
  }
  const { url } = await inquirer.prompt([
    {
      type: "input",
      name: "url",
      message: "Enter the YouTube or YouTube Music link:",
      validate: (input) => {
        if (!input || input.trim() === "") {
          return "⚠️ You must provide a URL!";
        }

        const ytRegex =
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\/.+$/;

        if (!ytRegex.test(input.trim())) {
          return "⚠️ Please enter a valid YouTube or YouTube Music link!";
        }

        return true;
      },
    },
  ]);

  const defaultDownloadPath = path.join(os.homedir(), "Downloads");

  const { destAction } = await inquirer.prompt([
    {
      type: "list",
      name: "destAction",
      message: "Do you want to set a destination folder or cancel?",
      choices: ["Enter destination", "Cancel"],
    },
  ]);

  if (destAction === "Cancel") {
    console.log("❌ Cancelled. Exiting...");
    process.exit(0);
  }

  let { destination } = await inquirer.prompt([
    {
      type: "input",
      name: "destination",
      message: "Enter the destination folder:",
      default: defaultDownloadPath,
    },
  ]);

  if (!destination.trim()) {
    destination = defaultDownloadPath;
    console.log("⚠️ No destination entered. Using default:", destination);
  }

  console.log("🎶 Downloading...");

  // Playlist download
  if (choice.startsWith("1")) {
    const command = `"${ytdlpPath}" -x --audio-format mp3 --ffmpeg-location "${ffmpegPath}" -o "${destination}/%(playlist_title)s/%(title)s.%(ext)s" "${url}"`;

    const process = cmd.run(command);
    process.stdout.on("data", (data) => console.log(data.toString()));
    process.stderr.on("data", (data) => console.error(data.toString()));

    process.on("close", () => {
      console.log(
        "✅ Playlist download finished! Files saved in:",
        destination
      );
      askAgain();
    });
  }
  // Album download
  else {
    const command = `"${ytdlpPath}" -x --audio-format mp3 --ffmpeg-location "${ffmpegPath}" -o "${destination}/%(album)s/%(playlist_index)02d - %(artist)s - %(title)s.%(ext)s" "${url}"`;

    const process = cmd.run(command);
    process.stdout.on("data", (data) => console.log(data.toString()));
    process.stderr.on("data", (data) => console.error(data.toString()));

    process.on("close", () => {
      console.log("✅ Album download finished! Files saved in:", destination);
      askAgain();
    });
  }
}

async function askAgain() {
  const { again } = await inquirer.prompt([
    {
      type: "list",
      name: "again",
      message: "Do you want to download again?",
      choices: ["Yes", "No, Exit"],
    },
  ]);

  if (again === "Yes") {
    await downloadFlow();
  } else {
    console.log("👋 Exiting... Goodbye!");
    process.exit(0);
  }
}

async function main() {
  await downloadFlow();
}

main();
