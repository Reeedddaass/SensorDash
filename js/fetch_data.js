export async function fetchData() {
    try {
        const response = await fetch('data.php');
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}