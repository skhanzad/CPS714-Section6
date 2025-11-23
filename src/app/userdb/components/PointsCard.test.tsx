import React from 'react';
import { render, screen } from '@testing-library/react';
import PointsCard from "./PointsCard";
import '@testing-library/jest-dom';



describe("PointsCard", () => {
   // Test case that suceeds
 it("renders correctly", () => {
   render(<PointsCard totalPoints={1000} cardLastDigits="1234" />);
   screen.debug();
       // Check that total points are displayed
    const pointsElement = screen.getByText("1,000");
    expect(pointsElement).toBeInTheDocument();
    
      // Check that card last digits are displayed
      const digitsElement = screen.getByText(/\*{4}\s1234/); // matches "**** 1234"
      expect(digitsElement).toBeInTheDocument();

 });
 
 // Test case that fails
 it("renders incorrectly", () => {
  render(<PointsCard totalPoints={500000} cardLastDigits="2525" />);
      // Check that total points are displayed
   const pointsElement = screen.getByText("500,000");
   expect(pointsElement).toBeInTheDocument();
   
     // Check that card last digits are displayed
     const digitsElement = screen.getByText(/\*{4}\s2525/);
     expect(digitsElement).toBeInTheDocument();

});
});

