import { useEffect, useState } from "react";

import {
  useLocation,
} from "react-router-dom";


function ClaimRequests() {

  const location =
    useLocation();


  const [myClaims, setMyClaims] =
    useState([]);

  const [receivedClaims, setReceivedClaims] =
    useState([]);


  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  const user =
    JSON.parse(
      localStorage.getItem("user")
    );


  // ==========================================
  // FETCH CLAIMS
  // ==========================================

  useEffect(() => {

    const fetchClaims = async () => {

      if (!user || !user.id) {

        setError(
          "Please login to view your claims."
        );

        setLoading(false);

        return;
      }


      try {

        // CLAIMS SUBMITTED BY ME

        const myResponse =
          await fetch(
            `http://localhost:5000/api/claims/my/${user.id}`
          );


        const myData =
          await myResponse.json();


        if (!myResponse.ok) {

          setError(
            myData.message ||
            "Unable to load your claims"
          );

          setLoading(false);

          return;
        }


        setMyClaims(myData);


        // CLAIMS RECEIVED BY ME

        const receivedResponse =
          await fetch(
            `http://localhost:5000/api/claims/received/${user.id}`
          );


        const receivedData =
          await receivedResponse.json();


        if (!receivedResponse.ok) {

          setError(
            receivedData.message ||
            "Unable to load received claims"
          );

          setLoading(false);

          return;
        }


        setReceivedClaims(
          receivedData
        );


      } catch (error) {

        console.log(error);

        setError(
          "Unable to connect to server."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchClaims();

  }, []);


  // ==========================================
  // OPEN CLAIM FROM NOTIFICATION
  // ==========================================

  useEffect(() => {

    const openClaimId =
      location.state?.openClaimId;


    if (!openClaimId) {
      return;
    }


    // Wait until claims have loaded

    if (
      myClaims.length === 0 &&
      receivedClaims.length === 0
    ) {
      return;
    }


    // Find exact claim

    const claimElement =
      document.getElementById(
        `claim-${openClaimId}`
      );


    if (claimElement) {

      claimElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });


      // Temporary highlight

      claimElement.style.boxShadow =
        "0 0 0 3px #222";


      setTimeout(() => {

        if (
          claimElement
        ) {
          claimElement.style.boxShadow =
            "";
        }

      }, 2500);

    }

  }, [
    location.state,
    myClaims,
    receivedClaims,
  ]);


  // ==========================================
  // APPROVE CLAIM
  // ==========================================

  const handleApprove =
    async (claimId) => {

      const confirmApprove =
        window.confirm(
          "Are you sure you want to approve this claim?"
        );


      if (!confirmApprove) {
        return;
      }


      try {

        const response =
          await fetch(
            `http://localhost:5000/api/claims/${claimId}/approve`,
            {
              method: "PUT",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          setMessage(
            data.message ||
            "Unable to approve claim."
          );

          return;
        }


        setMessage(
          "Claim approved successfully."
        );


        await refreshClaims();


      } catch (error) {

        console.log(error);

        setMessage(
          "Unable to connect to server."
        );

      }

    };


  // ==========================================
  // REJECT CLAIM
  // ==========================================

  const handleReject =
    async (claimId) => {

      const confirmReject =
        window.confirm(
          "Are you sure you want to reject this claim?"
        );


      if (!confirmReject) {
        return;
      }


      try {

        const response =
          await fetch(
            `http://localhost:5000/api/claims/${claimId}/reject`,
            {
              method: "PUT",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          setMessage(
            data.message ||
            "Unable to reject claim."
          );

          return;
        }


        setMessage(
          "Claim rejected successfully."
        );


        await refreshClaims();


      } catch (error) {

        console.log(error);

        setMessage(
          "Unable to connect to server."
        );

      }

    };


  // ==========================================
  // MARK AS RETURNED
  // ==========================================

  const handleReturned =
    async (foundItemId) => {

      const confirmReturn =
        window.confirm(
          "Have you received the item? Mark it as returned?"
        );


      if (!confirmReturn) {
        return;
      }


      try {

        const response =
          await fetch(
            `http://localhost:5000/api/items/${foundItemId}/returned`,
            {
              method: "PUT",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          setMessage(
            data.message ||
            "Unable to mark item as returned."
          );

          return;
        }


        setMessage(
          "Item marked as returned successfully."
        );


        await refreshClaims();


      } catch (error) {

        console.log(error);

        setMessage(
          "Unable to connect to server."
        );

      }

    };


  // ==========================================
  // REFRESH CLAIMS
  // ==========================================

  const refreshClaims =
    async () => {

      if (!user || !user.id) {
        return;
      }


      try {

        const myResponse =
          await fetch(
            `http://localhost:5000/api/claims/my/${user.id}`
          );


        const myData =
          await myResponse.json();


        if (myResponse.ok) {

          setMyClaims(
            myData
          );

        }


        const receivedResponse =
          await fetch(
            `http://localhost:5000/api/claims/received/${user.id}`
          );


        const receivedData =
          await receivedResponse.json();


        if (receivedResponse.ok) {

          setReceivedClaims(
            receivedData
          );

        }


      } catch (error) {

        console.log(
          "Refresh claims error:",
          error
        );

      }

    };


  // ==========================================
  // STATUS
  // ==========================================

  const getStatusClass =
    (status) => {

      if (
        status === "Approved"
      ) {
        return "claim-status approved";
      }


      if (
        status === "Rejected"
      ) {
        return "claim-status rejected";
      }


      return "claim-status pending";

    };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="claims-page">

        <div className="claims-loading">

          <div className="claims-loading-icon">
            ⏳
          </div>

          <h2>
            Loading your claims...
          </h2>

          <p>
            Please wait while we fetch
            your claim information.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="claims-page">

        <div className="claims-error">

          <div className="claims-error-icon">
            !
          </div>

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="claims-page">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="claims-header">

        <p className="claims-small-title">
          CLAIMS DASHBOARD
        </p>

        <h1>
          Manage your claims
        </h1>

        <p>
          Track the items you have claimed
          and manage requests received for
          items you found.
        </p>

      </div>


      {/* ================================= */}
      {/* MESSAGE */}
      {/* ================================= */}

      {message && (

        <div className="claims-message">

          <span>
            ✓
          </span>

          {message}

          <button
            onClick={() =>
              setMessage("")
            }
            type="button"
          >
            ×
          </button>

        </div>

      )}


      {/* ================================= */}
      {/* MY CLAIMS */}
      {/* ================================= */}

      <section
        className="claims-section submitted-section"
      >

        <div className="section-heading">

          <div className="section-heading-left">

            <div className="section-icon submitted-icon">
              ↑
            </div>

            <div>

              <p className="section-label">
                MY ACTIVITY
              </p>

              <h2>
                Claims I Submitted
              </h2>

              <p>
                Items you have requested to claim.
              </p>

            </div>

          </div>


          <div className="claim-count">

            {myClaims.length}

            <span>
              {myClaims.length === 1
                ? " Claim"
                : " Claims"}
            </span>

          </div>

        </div>


        {myClaims.length === 0 ? (

          <div className="claims-empty">

            <div className="empty-icon">
              📋
            </div>

            <h3>
              No claims submitted yet
            </h3>

            <p>
              When you claim a found item,
              your request will appear here.
            </p>

          </div>

        ) : (

          <div className="claims-grid">

            {myClaims.map(
              (claim) => (

                <div
                  className="claim-card"
                  key={claim._id}
                  id={`claim-${claim._id}`}
                >

                  {/* CARD TOP */}

                  <div className="claim-card-top">

                    <div className="claim-item-image">

                      {claim.item?.image ? (

                        <img
                          src={
                            claim.item.image
                          }
                          alt={
                            claim.item.name
                          }
                        />

                      ) : (

                        <span>
                          📦
                        </span>

                      )}

                    </div>


                    <div className="claim-item-title">

                      <p className="claim-type-label">
                        FOUND ITEM
                      </p>

                      <h3>
                        {claim.item
                          ? claim.item.name
                          : "Item unavailable"}
                      </h3>

                    </div>

                  </div>


                  {claim.item ? (

                    <>

                      {/* ITEM DETAILS */}

                      <div className="claim-details">

                        <div>

                          <span>
                            Category
                          </span>

                          <strong>
                            {claim.item.category}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Found at
                          </span>

                          <strong>
                            {claim.item.location}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Date
                          </span>

                          <strong>
                            {claim.item.date}
                          </strong>

                        </div>

                      </div>


                      {/* MESSAGE */}

                      <div className="claim-message-box">

                        <p className="claim-box-title">
                          Your claim message
                        </p>

                        <p>
                          {claim.message}
                        </p>

                      </div>


                      {/* STATUS */}

                      <div className="claim-status-row">

                        <span>
                          Status
                        </span>


                        {claim.item.status ===
                        "Returned" ? (

                          <span className="claim-status returned">
                            ✓ Returned
                          </span>

                        ) : (

                          <span
                            className={
                              getStatusClass(
                                claim.status
                              )
                            }
                          >
                            {claim.status}
                          </span>

                        )}

                      </div>


                      {/* APPROVED */}

                      {claim.status ===
                        "Approved" &&
                        claim.item.status !==
                          "Returned" && (

                          <div className="claim-action-area approved-area">

                            <div className="approved-message">

                              <span>
                                ✓
                              </span>

                              <div>

                                <strong>
                                  Claim approved
                                </strong>

                                <p>
                                  Contact the person who
                                  found the item to arrange
                                  its return.
                                </p>

                              </div>

                            </div>


                            <button
                              type="button"
                              className="return-btn"
                              onClick={() =>
                                handleReturned(
                                  claim.item._id
                                )
                              }
                            >
                              Mark as Returned
                            </button>

                          </div>

                        )}


                      {/* REJECTED */}

                      {claim.status ===
                        "Rejected" && (

                        <div className="rejected-message">

                          <span>
                            ✕
                          </span>

                          <p>
                            Your claim was rejected.
                          </p>

                        </div>

                      )}


                      {/* RETURNED */}

                      {claim.item.status ===
                        "Returned" && (

                        <div className="returned-message">

                          ✓ Item has been returned
                          successfully.

                        </div>

                      )}

                    </>

                  ) : (

                    <div className="unavailable-message">
                      This item is no longer available.
                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ================================= */}
      {/* DIVIDER */}
      {/* ================================= */}

      <div className="claims-divider">

        <span>
          CLAIM MANAGEMENT
        </span>

      </div>


      {/* ================================= */}
      {/* RECEIVED CLAIMS */}
      {/* ================================= */}

      <section
        className="claims-section received-section"
      >

        <div className="section-heading">

          <div className="section-heading-left">

            <div className="section-icon received-icon">
              ↓
            </div>

            <div>

              <p className="section-label">
                ACTION REQUIRED
              </p>

              <h2>
                Claim Requests Received
              </h2>

              <p>
                People who are claiming items
                you found.
              </p>

            </div>

          </div>


          <div className="claim-count received-count">

            {receivedClaims.length}

            <span>
              {receivedClaims.length === 1
                ? " Request"
                : " Requests"}
            </span>

          </div>

        </div>


        {receivedClaims.length === 0 ? (

          <div className="claims-empty">

            <div className="empty-icon">
              📥
            </div>

            <h3>
              No claim requests yet
            </h3>

            <p>
              When someone claims an item you
              reported as found, the request
              will appear here.
            </p>

          </div>

        ) : (

          <div className="claims-grid">

            {receivedClaims.map(
              (claim) => (

                <div
                  className="claim-card received-card"
                  key={claim._id}
                  id={`claim-${claim._id}`}
                >

                  {/* CARD TOP */}

                  <div className="claim-card-top">

                    <div className="claim-item-image">

                      {claim.item?.image ? (

                        <img
                          src={
                            claim.item.image
                          }
                          alt={
                            claim.item.name
                          }
                        />

                      ) : (

                        <span>
                          📦
                        </span>

                      )}

                    </div>


                    <div className="claim-item-title">

                      <p className="claim-type-label">
                        YOUR FOUND ITEM
                      </p>

                      <h3>
                        {claim.item
                          ? claim.item.name
                          : "Item unavailable"}
                      </h3>

                    </div>

                  </div>


                  {claim.item ? (

                    <>

                      {/* ITEM DETAILS */}

                      <div className="claim-details">

                        <div>

                          <span>
                            Category
                          </span>

                          <strong>
                            {claim.item.category}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Found at
                          </span>

                          <strong>
                            {claim.item.location}
                          </strong>

                        </div>

                      </div>


                      {/* CLAIMANT */}

                      <div className="claimant-box">

                        <div className="claimant-heading">

                          <span className="person-icon">
                            👤
                          </span>

                          <div>

                            <p className="claim-box-title">
                              Claimant Information
                            </p>

                            <p className="claimant-subtitle">
                              Person claiming this item
                            </p>

                          </div>

                        </div>


                        {claim.claimedBy && (

                          <div className="claimant-details">

                            <div>

                              <span>
                                Name
                              </span>

                              <strong>
                                {claim.claimedBy.name}
                              </strong>

                            </div>


                            <div>

                              <span>
                                Email
                              </span>

                              <strong>
                                {claim.claimedBy.email}
                              </strong>

                            </div>

                          </div>

                        )}

                      </div>


                      {/* MESSAGE */}

                      <div className="claim-message-box">

                        <p className="claim-box-title">
                          Claimant's message
                        </p>

                        <p>
                          {claim.message}
                        </p>

                      </div>


                      {/* STATUS */}

                      <div className="claim-status-row">

                        <span>
                          Status
                        </span>


                        {claim.item.status ===
                        "Returned" ? (

                          <span className="claim-status returned">
                            ✓ Returned
                          </span>

                        ) : (

                          <span
                            className={
                              getStatusClass(
                                claim.status
                              )
                            }
                          >
                            {claim.status}
                          </span>

                        )}

                      </div>


                      {/* PENDING */}

                      {claim.status ===
                        "Pending" &&
                        claim.item.status !==
                          "Returned" && (

                          <div className="claim-action-area">

                            <div className="pending-message">

                              <span>
                                !
                              </span>

                              <p>
                                Review the claimant's
                                information before making
                                a decision.
                              </p>

                            </div>


                            <div className="claim-buttons">

                              <button
                                type="button"
                                className="approve-btn"
                                onClick={() =>
                                  handleApprove(
                                    claim._id
                                  )
                                }
                              >
                                ✓ Approve Claim
                              </button>


                              <button
                                type="button"
                                className="reject-btn"
                                onClick={() =>
                                  handleReject(
                                    claim._id
                                  )
                                }
                              >
                                ✕ Reject
                              </button>

                            </div>

                          </div>

                        )}


                      {/* APPROVED */}

                      {claim.status ===
                        "Approved" &&
                        claim.item.status !==
                          "Returned" && (

                          <div className="claim-action-area approved-area">

                            <div className="approved-message">

                              <span>
                                ✓
                              </span>

                              <div>

                                <strong>
                                  Claim approved
                                </strong>

                                <p>
                                  Contact the claimant
                                  to arrange the return.
                                </p>

                              </div>

                            </div>


                            <button
                              type="button"
                              className="return-btn"
                              onClick={() =>
                                handleReturned(
                                  claim.item._id
                                )
                              }
                            >
                              Mark as Returned
                            </button>

                          </div>

                        )}


                      {/* RETURNED */}

                      {claim.item.status ===
                        "Returned" && (

                        <div className="returned-message">

                          ✓ This item has been returned
                          successfully.

                        </div>

                      )}

                    </>

                  ) : (

                    <div className="unavailable-message">
                      This item is no longer available.
                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>

  );

}


export default ClaimRequests;