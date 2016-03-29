using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Configuration;

namespace GAPauldingParentStudentImport
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length <= 1)
            {
                Console.WriteLine("Please enter a client database name.");
                Console.WriteLine("Usage: GAPauldingParentStudentImport <client_databasename> <cache_databasename>");
                return;

            }
                ProcessImportAsync(args).Wait();
        }

        static async Task ProcessImportAsync(string[] args)
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(ConfigurationManager.AppSettings["WebAPIUrl"] + ConfigurationManager.AppSettings["WebAPIAppPath"]);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.Timeout = System.TimeSpan.FromDays(14);

                var content = new FormUrlEncodedContent(new[] {
                new KeyValuePair<string, string>("cl", "abc")
            });
                Console.WriteLine("Begin API Invoke: " + ConfigurationManager.AppSettings["WebAPIAppPath"] + "/api/ProcessImport/Process?client=" + args[0] + "&cache=" + args[1]);
                HttpResponseMessage response = await client.PostAsync(ConfigurationManager.AppSettings["WebAPIAppPath"] + "/api/ProcessImport/Process?client=" + args[0] + "&cache=" + args[1], content);
                Console.Write(response.IsSuccessStatusCode
                    ? "Response from WebAPI successful."
                    : "Response from WebAPI failed and no Parents were setup.");
            }
        }
    }
}
