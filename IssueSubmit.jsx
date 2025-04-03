import React, { useState } from "react";

const IssueSubmit = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    regNo: "",
    name: "",
    subject: "",
    category: "Missing Marks",
    course: "Bachelor Of Science In Computer Science",
    description: "",
    attachment: null,
    yearOfStudy: "",
    semester: "Semester 1",
    lecturer: "",
  });

  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));

    if (type === "file" && files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleReset = () => {
    setFormData({
      studentId: "",
      regNo: "",
      name: "",
      subject: "",
      category: "Missing Marks",
      course: "Bachelor Of Science In Computer Science",
      description: "",
      attachment: null,
      yearOfStudy: "",
      semester: "Semester 1",
      lecturer: "",
    });
    setFileName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Issue submitted successfully!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Issue Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-box">
            <label htmlFor="studentId">Student ID</label>
            <input
              required
              type="text"
              placeholder="Insert your student number"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="input-box">
            <label htmlFor="regNo">Registration Number</label>
            <input
              required
              type="text"
              placeholder="Insert your registration number"
              name="regNo"
              value={formData.regNo}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="input-box">
            <label htmlFor="name">Name</label>
            <input
              required
              type="text"
              placeholder="Insert your full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="input-box">
            <label htmlFor="subject">Subject</label>
            <input
              required
              type="text"
              placeholder="Enter subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="input-box">
            <label htmlFor="category">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Missing Marks">Missing Marks</option>
              <option value="Corrections">Corrections</option>
              <option value="Appeal">Appeal</option>
            </select>
          </div>

          <div className="input-box">
            <label htmlFor="course">Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Bachelor Of Science In Computer Science">
                Bachelor Of Science In Computer Science
              </option>
              <option value="Bachelor Of Science In Software Engineering">
                Bachelor Of Science In Software Engineering
              </option>
              <option value="Bachelor Of Information Systems And Technology">
                Bachelor Of Information Systems And Technology
              </option>
              <option value="Bachelor Of Information Technology">
                Bachelor Of Information Technology
              </option>
              <option value="Bachelor Of Information Systems">
                Bachelor Of Information Systems
              </option>
              <option value="Bachelor Of Library And Information Sciences">
                Bachelor Of Library And Information Sciences
              </option>
            </select>
          </div>

          <div className="input-box">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              cols="30"
              rows="5"
              placeholder="Enter Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="input-box">
            <label htmlFor="attachment">Attachments</label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            {fileName && <p className="text-sm text-gray-600">Selected: {fileName}</p>}
          </div>

          <div className="input-box">
            <label htmlFor="yearOfStudy">Year Of Study</label>
            <input
              type="date"
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="input-box">
            <label htmlFor="semester">Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
            </select>
          </div>

          <div className="input-box">
            <label htmlFor="lecturer">Lecturer</label>
            <input
              type="search"
              placeholder="Search for lecturer"
              name="lecturer"
              value={formData.lecturer}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueSubmit;
