export const getLecturers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/lecturers/"); // Replace with your actual API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch lecturers");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      throw error;
    }
  };
  