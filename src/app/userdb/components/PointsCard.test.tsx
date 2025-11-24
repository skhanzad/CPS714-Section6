import React from 'react';
import { render, screen } from '@testing-library/react';
import PointsCard from "./PointsCard";
import '@testing-library/jest-dom';



describe("PointsCard", () => {
   // Test case that suceeds
 it("renders correctly", () => {
   render(<PointsCard totalPoints={1000} cardLastDigits="1234" />);
       // Check that total points are displayed
    const pointsElement = screen.getByText("1,000");
    expect(pointsElement).toBeInTheDocument();
    
      // Check that card last digits are displayed
      const digitsElement = screen.getByText(/\*{4}\s1234/); // matches "**** 1234"
      expect(digitsElement).toBeInTheDocument();

 });
 
 // Sample #2
 it("renders correctly", () => {
  render(<PointsCard totalPoints={500000} cardLastDigits="2525" />);
      // Check that total points are displayed
   const pointsElement = screen.getByText("500,000");
   expect(pointsElement).toBeInTheDocument();
   
     // Check that card last digits are displayed
     const digitsElement = screen.getByText(/\*{4}\s2525/);
     expect(digitsElement).toBeInTheDocument();

});

it("renders correctly", () => {
  render(<PointsCard totalPoints={0} cardLastDigits="0000" />);
      // Check that total points are displayed
   const pointsElement = screen.getByText("0");
   expect(pointsElement).toBeInTheDocument();
   
     // Check that card last digits are displayed
     const digitsElement = screen.getByText(/\*{4}\s0000/);
     expect(digitsElement).toBeInTheDocument();

});

it("renders correctly", () => {
  render(<PointsCard totalPoints={5} cardLastDigits="5200" />);
      // Check that total points are displayed
   const pointsElement = screen.getByText("5");
   expect(pointsElement).toBeInTheDocument();
   
     // Check that card last digits are displayed
     const digitsElement = screen.getByText(/\*{4}\s5200/);
     expect(digitsElement).toBeInTheDocument();

});

});