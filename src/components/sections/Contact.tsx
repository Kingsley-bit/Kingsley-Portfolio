import { useState, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { CONTACT_FORM_CONFIG } from "../../constants/config"; 
import { EarthCanvas } from "../canvas";
import { SectionWrapper } from "../../hoc";
import { slideIn } from "../../utils/motion";
import { config } from "../../constants/config";
import { Header } from "../atoms/Header";

const INITIAL_STATE = Object.fromEntries(
  Object.keys(config.contact.form).map((input) => [input, ""])
);

const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID, 
  accessToken: import.meta.env.VITE_EMAILJS_ACCESS_TOKEN,
};

const Contact = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string): boolean  => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      setEmailError(validateEmail(value) ? "" : "Invalid email format");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      setEmailError("Invalid email format");
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    emailjs
      .send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
          from_name: form.name,
          to_name: config.html.fullName,
          reply_to: form.email,
          to_email: config.html.email,
          message: form.message,
        },
        emailjsConfig.accessToken
      )
      .then(() => {
        setLoading(false);
        setMessage({ type: "success", text: "Thank you! I will get back to you as soon as possible." });
        setForm(INITIAL_STATE);
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      })
      .catch((error) => {
        setLoading(false);
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
        console.error(error);
      });
  };

  return (
    <div className="flex flex-col-reverse gap-10 overflow-hidden xl:mt-12 xl:flex-row">
      <motion.div variants={slideIn("left", "tween", 0.2, 1)} className="bg-black-100 flex-[0.75] rounded-2xl p-8">
        <Header useMotion={false} {...config.contact} />

        <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
        {Object.entries(CONTACT_FORM_CONFIG.form).map(([key, { span, placeholder }]) => {
            const Component = key === "message" ? "textarea" : "input";

            return (
              <label key={key} className="flex flex-col">
              <span className="mb-4 font-medium text-white">{span}</span>
              <Component
                type={key === "email" ? "email" : "text"}
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={placeholder}
                className="bg-tertiary placeholder:text-secondary rounded-lg border-none px-6 py-4 font-medium text-white outline-none"
                {...(key === "message" && { rows: 7 })}
              />
              {key === "email" && emailError && (
                <p className="mt-2 text-red-500 text-sm">{emailError}</p>
              )}
            </label>
            );
          })}
          <button
            type="submit"
            className="bg-tertiary shadow-primary w-fit rounded-xl px-8 py-3 font-bold text-white shadow-md outline-none"
          >
            {loading ? "Sending..." : "Send"}
          </button>
          {message.text && (
            <p className={`mt-4 text-center font-medium ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
              {message.text}
            </p>
          )}
        </form>
      </motion.div>

      <motion.div variants={slideIn("right", "tween", 0.2, 1)} className="h-[350px] md:h-[550px] xl:h-auto xl:flex-1">
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
