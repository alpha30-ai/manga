async function checkChap() {
  const res = await fetch("https://api.mangadex.org/chapter/f7d2cb75-83b2-426b-bdbd-032870c30abb");
  const data = await res.json();
  console.log("Chapter data:", data);
}

checkChap();
