import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faSignOutAlt,
	faCog,
	faChartLine,
	faHistory,
	faMoneyBill,
	faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import ContentHeading from '../ContentHeading';
import ContentBody from '../ContentBody';

const Portfolio = () => {
	return (
		<>
			<ContentHeading>Portfolio</ContentHeading>
			<ContentBody>Body</ContentBody>
		</>
	);
};

export default Portfolio;
