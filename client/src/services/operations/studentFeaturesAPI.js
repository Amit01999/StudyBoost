import { toast } from 'react-hot-toast';
import { studentEndpoints } from '../apis';
import { useNavigate } from 'react-router-dom';
import { apiConnector } from '../apiconnector';
import rzpLogo from '../../assets/Logo/rzp_logo.png';
import { setPaymentLoading } from '../../slices/courseSlice';
import { resetCart } from '../../slices/cartSlice';
import { useSelector } from 'react-redux';

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

export async function buyCourse(
  token,
  courseId,
  userDetails,
  navigate,
  dispatch
) {
  try {
    console.log(userDetails);
    const response = await apiConnector(
      'POST',
      COURSE_PAYMENT_API,
      userDetails
    );
    console.log('Payment api cnnect ', response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    console.log('i am hit after API call');
    toast.success('OTP Sent Successfully');
    navigate(`/verify-payment-email/${courseId}`);
    // verifyPayment(bodyData, token, navigate, dispatch);
  } catch (error) {
    console.log('Payment API ERROR............', error);
    toast.error('Payment Failed');
  }
}

// verify payment
export async function verifyPayment(otp, token, courseId, navigate, dispatch) {
  console.log(' verify paymrnt api hit');
  const toastId = toast.loading('Verifying Payment....');
  dispatch(setPaymentLoading(true));
  try {
    const data = { courseId: courseId, otp: otp, token: token };
    const response = await apiConnector('POST', COURSE_VERIFY_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success('payment Successful, ypou are addded to the course');
    navigate('/dashboard/enrolled-courses');
    dispatch(resetCart());
  } catch (error) {
    console.log('PAYMENT VERIFY ERROR....', error);
    toast.error('Could not verify Payment');
  }
  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}

// function loadScript(src) {
//     return new Promise((resolve) => {
//         const script = document.createElement("script");
//         script.src = src;

//         script.onload = () => {
//             resolve(true);
//         }
//         script.onerror= () =>{
//             resolve(false);
//         }
//         document.body.appendChild(script);
//     })
// }

//verify payment
// async function verifyPayment(bodyData, token, navigate, dispatch) {
//   console.log('paymrnt api hit');
//   const toastId = toast.loading('Verifying Payment....');
//   dispatch(setPaymentLoading(true));
//   try {
//     const response = await apiConnector('POST', COURSE_VERIFY_API, bodyData, {
//       Authorization: `Bearer ${token}`,
//     });

//     if (!response.data.success) {
//       throw new Error(response.data.message);
//     }
//     toast.success('payment Successful, ypou are addded to the course');
//     navigate('/dashboard/enrolled-courses');
//     dispatch(resetCart());
//   } catch (error) {
//     console.log('PAYMENT VERIFY ERROR....', error);
//     toast.error('Could not verify Payment');
//   }
//   toast.dismiss(toastId);
//   dispatch(setPaymentLoading(false));
// }

// export async function buyCourse(
//   token,
//   courses,
//   userDetails,
//   navigate,
//   dispatch
// ) {
//   const Useremail = userDetails.email;

//   console.log(Useremail);
//   // try {
//load the script
// const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

// if(!res) {
//     toast.error("RazorPay SDK failed to load");
//     return;
// }

//initiate the order
// try {
//   const orderResponse = await apiConnector(
// 'POST',
// COURSE_PAYMENT_API,
// { userDetails }
// { courses }
// { Authorization: `Bearer ${token}` }
// );
//   console.log('oderresponse on student feature api', orderResponse);
// } catch (error) {
//   console.log('PAYMENT API ERROR.....', error);
//   toast.error('Could not make Payment');
// }

// if (!orderResponse.data.success) {
//   throw new Error(orderResponse.data.message);
// }
// console.log('PRINTING orderResponse', orderResponse);
// verifyPayment();

//options
// const options = {
//     key: process.env.RAZORPAY_KEY,
//     currency: orderResponse.data.message.currency,
//     amount: `${orderResponse.data.message.amount}`,
//     order_id:orderResponse.data.message.id,
//     name:"StudyBoost",
//     description: "Thank You for Purchasing the Course",
//     image:rzpLogo,
//     prefill: {
//         name:`${userDetails.firstName}`,
//         email:userDetails.email
//     },
//     handler: function(response) {
//         //send successful wala mail
//         sendPaymentSuccessEmail(response, orderResponse.data.message.amount,token );
//         //verifyPayment
//         verifyPayment({...response, courses}, token, navigate, dispatch);
//     }
// }
//miss hogya tha
// const paymentObject = new window.Razorpay(options);
// paymentObject.open();
// paymentObject.on("payment.failed", function(response) {
//     toast.error("oops, payment failed");
//     console.log(response.error);
// })
// } catch (error) {
//   console.log('PAYMENT API ERROR.....', error);
//   toast.error('Could not make Payment');
// }
// toast.dismiss(toastId);
// }

// async function sendPaymentSuccessEmail(response, amount, token) {
//   console.log('paymrnt api hit');
//   //   try {
//   //     await apiConnector(
//   //       'POST',
//   //       SEND_PAYMENT_SUCCESS_EMAIL_API,
//   //       {
//   //         orderId: response.razorpay_order_id,
//   //         paymentId: response.razorpay_payment_id,
//   //         amount,
//   //       },
//   //       {
//   //         Authorization: `Bearer ${token}`,
//   //       }
//   //     );
//   //   } catch (error) {
//   //     console.log('PAYMENT SUCCESS EMAIL ERROR....', error);
//   //   }
// }
