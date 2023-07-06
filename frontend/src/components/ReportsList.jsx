import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";

import { LemmyHttp } from "lemmy-js-client";

import { PostReportItem, CommentReportItem, PMReportItem } from "./ReportListItem";

import useLemmyHttp from "../hooks/useLemmyHttp";

export default function ReportsList() {
  const selectedCommunity = useSelector((state) => state.configReducer.selectedCommunity);

  const [showResolved, setShowResolved] = React.useState(false);
  const [showIgnored, setShowIgnored] = React.useState(false);

  const {
    data: commentReportsData,
    loading: commentReportsLoading,
    error: commentReportsError,
  } = useLemmyHttp("listCommentReports");

  const {
    data: postReportsData,
    loading: postReportsLoading,
    error: postReportsError,
  } = useLemmyHttp("listPostReports");

  const {
    data: pmReportsData,
    loading: pmReportsLoading,
    error: pmReportsError,
  } = useLemmyHttp("listPrivateMessageReports");

  const mergedReports = React.useMemo(() => {
    if (!commentReportsData || !postReportsData || !pmReportsData) return [];

    let normalPostReports = postReportsData.post_reports.map((report) => {
      return {
        ...report,
        type: "post",
        time: report.post_report.published,
        resolved: report.post_report.resolved,
      };
    });

    let normalCommentReports = commentReportsData.comment_reports.map((report) => {
      return {
        ...report,
        type: "comment",
        time: report.comment_report.published,
        resolved: report.comment_report.resolved,
      };
    });

    let normalPMReports = pmReportsData.private_message_reports.map((report) => {
      return {
        ...report,
        type: "pm",
        time: report.private_message_report.published,
        resolved: report.private_message_report.resolved,
      };
    });

    let mergedReports = [...normalPostReports, ...normalCommentReports, ...normalPMReports];

    // filter to one community
    if (selectedCommunity !== "all") {
      mergedReports = mergedReports.filter((report) => {
        return report.community.name === selectedCommunity;
      });
    }

    // filter out resolved reports
    if (!showResolved) {
      mergedReports = mergedReports.filter((report) => {
        return !report.resolved;
      });
    }

    console.log("mergedReports", mergedReports);

    mergedReports.sort((a, b) => {
      // check for values that are null
      if (!a.post_report?.published) return 1;
      if (!b.post_report?.published) return -1;

      return new Date(b.post_report.published).getTime() - new Date(a.post_report.published).getTime();
    });

    console.log("mergedReports", mergedReports);
    return mergedReports;
  }, [commentReportsData, postReportsData, pmReportsData, selectedCommunity, showResolved, showIgnored]);

  return (
    <Box
      sx={{
        pt: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Sheet
        sx={{
          display: "flex",
          flexDirection: "row",
          borderRadius: 4,
          p: 1,
          gap: 2,
          mb: 0,
          pb: 0,
        }}
      >
        <Box>
          <Checkbox
            label="Show Resolved"
            variant="outlined"
            value={showResolved}
            onChange={() => setShowResolved(!showResolved)}
          />
        </Box>
        <Box>
          <Checkbox
            label="Show Ignored"
            variant="outlined"
            value={showIgnored}
            onChange={() => setShowIgnored(!showIgnored)}
          />
        </Box>
      </Sheet>

      {mergedReports.length > 0 &&
        mergedReports.map((report, index) => {
          if (report.type === "comment") {
            return <CommentReportItem key={index} report={report} />;
          } else if (report.type === "post") {
            console.log("WERGFERGHERGERG", report);
            return <PostReportItem key={index} report={report} />;
          } else if (report.type === "pm") {
            return <PMReportItem key={index} report={report} />;
          }
        })}
    </Box>
  );
}
