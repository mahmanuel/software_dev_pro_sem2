import React from 'react'

const IssueSubmit = () => {
  return (
      <div>
      <div className="container">
      <h1>Issue Form</h1>
      <form action="#" className="form">
        <div className="input-box">
          <label for="student-id">Student ID</label>
            <input required type="text" placeholder="Insert your student Number" name="student-id"/>
          </div>
        <div className="input-box">
          <label for="reg-no">Registration Number</label>
          <input required type="text" placeholder="Insert your Reg Number" name="reg-no"/>
        </div>
        <div className="input-box">
          <label for="name">Name</label>
          <input required type="text" placeholder="Insert your full names" name="name"/>
        </div>
        <div className="input-box">
          <label for="subject">Subject</label>
          <input required type="text" placeholder="Insert your full names" name="subject"/>
        </div>
        <div className="input-box">
          <label for="category">Category</label>
          <select className="category" name="category">
            <option value="Missing marks">Missing Marks</option>
            <option value="Corrections">Corrections</option>
            <option value="Appeal">Appeal</option>
          </select>
        </div>
        <div className="input-box">
          <label for="category">Course</label>
          <select className="category" name="category">
            <option value="Missing marks">Bachelor Of Science In Computer Science</option>
            <option value="Appeal">Bachelor Of Science In Software Engineering</option>
            <option value="Corrections">Bachelor Of Information Systems And Technology</option>
            <option value="Appeal">Bachelor Of Information Technology</option>
            <option value="Appeal">Bachelor Of Information Systems</option>
            <option value="Appeal">Bachelor Of Liberary And Information Sciences</option>
          </select>
        </div>
        <div class="input-box">
          <label for="Description">Description</label>
          <textarea class="description" cols="30" rows="5" placeholder="Enter Description" name="about"/>
        </div>
       
        <div className="attachments">
        <label for="Attachments">Attachments</label>
          <input required type="file" placeholder="Select File" name="Attachments"/>
        </div>
        <div className="input-box">
          <label for="subject">Year Of Study</label>
          <input type="date" placeholder="Insert your full names" name="subject"/>
        </div>
        <div className="input-box">
          <label for="category">Semester</label>
          <select className="category" name="category">
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="semester 3">Semester 3</option>
            <option value="semester 4">Semester 4</option>
          </select>
        </div>
        <div className="input-box">
          <label for="lecturer">Lecturer</label>
          <input type="search" placeholder="Search" name="lecturer"/>
        </div>

      <div className="button">
      <button type="button">Reset</button>
      <button type="submit">Submit</button>
      </div>
</form>
    </div>
    </div>
  )
}

export default IssueSubmit;
